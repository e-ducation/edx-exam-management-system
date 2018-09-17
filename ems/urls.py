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
from django.contrib.auth.decorators import login_required

from auth_backends.urls import auth_urlpatterns
from django.views.generic import TemplateView

from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
    openapi.Info(
        title="Exam Management System API",
        default_version='v1',
        description="Exam Management System API",
        contact=openapi.Contact(email="code@e-ducation.cn"),
        license=openapi.License(name="AGPL-3.0 License"),
    ),
    validators=['flex', 'ssv'],
)

urlpatterns = auth_urlpatterns + [
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('exam_paper.api.urls')),
    url(r'^$', login_required(TemplateView.as_view(template_name='index.html'))),
]
