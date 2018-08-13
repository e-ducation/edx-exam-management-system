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

from django.conf.urls import url, include
from django.contrib import admin

from django.conf.urls import url
from rest_framework_swagger.views import get_swagger_view
from auth_backends.urls import auth_urlpatterns

schema_view = get_swagger_view(title='Exam Management System API')

urlpatterns = auth_urlpatterns + [
    url(r'^$', schema_view),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('exam_paper.api.urls')),
]
