from django.urls import path
from . import views

urlpatterns=[
    path('',views.home,name='home'),
    path('send-details/',views.email_details,name='email_details'),
    path('approve-mail/',views.approve_mail,name='approve_mail'),
    path('reject-mail/',views.reject_mail,name='reject_mail')
]