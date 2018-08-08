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

from rest_framework import routers

from exam_paper.api.views import (
    ExamPaperListViewSet,
    ExamPaperFixedCreateViewSet,
    ExamPaperRandomCreateViewSet,
)


router = routers.SimpleRouter()
router.register(r'exampaper/fixed', ExamPaperFixedCreateViewSet, 'exampaper_fixed')
router.register(r'exampaper/random', ExamPaperRandomCreateViewSet, 'exampaper_random')
router.register(r'exampaper', ExamPaperListViewSet, 'exampaper')
urlpatterns = router.urls
