from django.shortcuts import render,redirect
from django.conf import settings
from django.core.mail import EmailMessage
import json
from django.http import JsonResponse


# Create your views here.

def home(request):
    return render(request,'home.html')

def send_message(request):
    if request.method=='POST':
        try:
            data=json.loads(request.body)
            sender_email=data.get('senderEmail')
            mail_subject=data.get('emailSubject')
            message=data.get('emailBody')

            email=EmailMessage(
                subject=f'{mail_subject}',
                body=f'{message}',
                from_email=f'{settings.EMAIL_HOST_USER}',
                to=['sarathc381@gmail.com'],
                reply_to=[sender_email]
            )

            email.send(fail_silently=False)
            return JsonResponse({'status':'mail sent successfully'},status=200)
        except Exception as e:
            return JsonResponse({'status':'request failed','details':str(e)},status=500)
    return JsonResponse({'status':'something went wrong'},status=400)

