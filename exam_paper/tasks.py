# -*- coding:utf-8 -*-
from __future__ import absolute_import, unicode_literals

from ems.celery import app
from exam_paper.models import ExamTask


@app.task
def start_exam_task(exam_task_id):
    task = ExamTask.objects.get(pk=exam_task_id)
    task.task_state = 'started'
    task.save()
