# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.

from .models import ExamPaper, ExamPaperProblems, ExamPaperCreateRule

admin.site.register(ExamPaper)
admin.site.register(ExamPaperProblems)
admin.site.register(ExamPaperCreateRule)
