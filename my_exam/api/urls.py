# -*- coding:utf-8 -*-
"""my_exam URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from __future__ import unicode_literals

from django.conf.urls import url
from rest_framework import routers

from my_exam.api.views import (
    MyExamViewSet,
    ExamParticipantAnswerViewSet
)

urlpatterns = [
]

router = routers.SimpleRouter()
router.register(r'my_exam', MyExamViewSet, base_name='my_exam_list')
router.register(r'exam_task/exam_answers', ExamParticipantAnswerViewSet, 'my_exam_answer')
urlpatterns += router.urls
