# -*- coding:utf-8 -*-
"""ems URL Configuration

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

from exam_paper.api.views import (
    BlocksProblemsListAPIView,
    ExamPaperListViewSet,
    ExamPaperFixedCreateViewSet,
    ExamPaperRandomCreateViewSet,
    CoursesListAPIView,
    CourseSectionsListAPIView,
    ProblemsDetailAPIView,
    ProblemsTypesAPIView,
)

urlpatterns = [
    url(r'^courses/$', CoursesListAPIView.as_view()),
    url(r'^courses/(?P<course_id>.+)/sections/$',
        CourseSectionsListAPIView.as_view()),
    url(r'^problems/detail/$', ProblemsDetailAPIView.as_view()),
    url(r'^problems/types/$', ProblemsTypesAPIView.as_view()),
    url(r'^xblocks/(?P<block_id>.+)/problems/$', BlocksProblemsListAPIView.as_view()),
]

router = routers.SimpleRouter()
router.register(r'exampapers/fixed', ExamPaperFixedCreateViewSet, 'exampaper_fixed')
router.register(r'exampapers/random', ExamPaperRandomCreateViewSet, 'exampaper_random')
router.register(r'exampapers', ExamPaperListViewSet, 'exampaper')
urlpatterns += router.urls
