from django.shortcuts import render,redirect
from django.views.decorators.http import require_POST
from django.conf import settings
from django.core.mail import EmailMessage
import json
from django.http import JsonResponse
import uuid
from .emailingAgent.graph import graph
from langgraph.types import Command
from django.core.cache import cache
import logging


# Create your views here.

def get_ip(request):
    forwarded=request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[-1].strip()
    return request.META.get('REMOTE_ADDR')

def is_rate_limited(request, limit=5, window=3600):
    key=f'drafts:{get_ip(request)}'
    cache.add(key, 0, timeout=window)
    count=cache.incr(key)
    return count > limit

def home(request):
    return render(request,'home.html')

# def home2(request):
#     return render(request,'home2.html')

def _config(thread_id):
    return {"configurable":{'thread_id':thread_id}}

@require_POST
def email_details(request):
    if request.method=='POST':

        if is_rate_limited(request):
            return JsonResponse({'msg':'Too Many Attampts please try again later'},status=429)

        email_data=json.loads(request.body)
        visitor_email=email_data.get('visitor_email')
        mail_context=email_data.get('mail_context')

        thread_id=str(uuid.uuid4())
        request.session['thread_id']=thread_id

        logger = logging.getLogger(__name__)

        try:
            result=graph.invoke({
                'email':visitor_email,
                'context':mail_context,
                'subject':None,
                'body':None,
                'approved':None
            },_config(thread_id))
        except Exception:
            logger.exception("Email agent execution failed")
            request.session.pop('thread_id',None)
            return JsonResponse({'msg':'something went wrong email is not generated'},status=502)

        interrupter=result.get('__interrupt__')
        if not interrupter:
            request.session.pop('thread_id',None)
            return JsonResponse({'msg':'something went wrong email is not generated'},status=502)

        drafted_email=interrupter[0].value
        return JsonResponse({
            'subject':drafted_email['subject'],
            'body':drafted_email['body'],
            'approved':'Pending'
        },status=200)
    return JsonResponse({'msg':'something went wrong'},status=400)

def _resume(request,decision):
    thread_id=request.session.get('thread_id')
    if not thread_id:
        return JsonResponse({'msg':'no draft to act on'},status=400)

    config=_config(thread_id)
    if not graph.get_state(config).next:
        request.session.pop('thread_id',None)
        return JsonResponse({'msg':'This draft is no longer active.'},status=400)

    try:
        graph.invoke(Command(resume=decision),config)
    except Exception as e:
        return JsonResponse({'msg': 'Could not send the email. Please try again.'}, status=502)

    request.session.pop('thread_id', None)   
    return JsonResponse({"status": "sent" if decision else "cancelled"})
        

@require_POST
def approve_mail(request):
    return _resume(request, True)

@require_POST
def reject_mail(request):
    return _resume(request, False)




# def send_message(request):
#     if request.method=='POST':
#         try:
#             data=json.loads(request.body)
#             sender_email=data.get('senderEmail')
#             mail_subject=data.get('emailSubject')
#             message=data.get('emailBody')

#             email=EmailMessage(
#                 subject=f'{mail_subject}',
#                 body=f'{message}',
#                 from_email=f'{settings.EMAIL_HOST_USER}',
#                 to=['sarathc381@gmail.com'],
#                 reply_to=[sender_email]
#             )

#             email.send(fail_silently=False)
#             return JsonResponse({'status':'mail sent successfully'},status=200)
#         except Exception as e:
#             return JsonResponse({'status':'request failed','details':str(e)},status=500)
#     return JsonResponse({'status':'something went wrong'},status=400)

