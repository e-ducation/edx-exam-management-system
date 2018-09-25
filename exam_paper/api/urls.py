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
    SectionProblemTypeCountView,
    UserInfoView,
    ExamParticipantViewSet,
    ExamTaskViewSet,
    UserInfoListView,
)

urlpatterns = [
    url(r'^courses/$', CoursesListAPIView.as_view(), name='course_list'),
    url(r'^courses/(?P<course_id>.+)/sections/$',
        CourseSectionsListAPIView.as_view()),
    url(r'^problems/detail/$', ProblemsDetailAPIView.as_view()),
    url(r'^problems/types/$', ProblemsTypesAPIView.as_view()),
    url(r'^xblocks/(?P<block_id>.+)/problems/$', BlocksProblemsListAPIView.as_view()),
    url(r'^sections/problems/count/$', SectionProblemTypeCountView.as_view()),
    url(r'^user/info/$', UserInfoView.as_view()),
    url(r'^users/$', UserInfoListView.as_view()),

]

router = routers.SimpleRouter()
router.register(r'exampapers/fixed', ExamPaperFixedCreateViewSet, base_name='exam_paper_fixed')
router.register(r'exampapers/random', ExamPaperRandomCreateViewSet, base_name='exam_paper_random')
router.register(r'exampapers', ExamPaperListViewSet, base_name='exam_paper')
router.register(r'examtasks', ExamTaskViewSet, base_name='exam_task')
router.register(r'examparticipants', ExamParticipantViewSet, 'examparticipants')

urlpatterns += router.urls
