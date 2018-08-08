# -*- coding:utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions


class IsExamPaperCreator(permissions.BasePermission):

    def has_permission(self, request, view):
        return
