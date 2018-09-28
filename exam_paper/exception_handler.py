# -*- coding:utf-8 -*-

from __future__ import unicode_literals

import logging

from django.core.exceptions import PermissionDenied

from django.http import Http404
from django.utils import six
from django.utils.translation import ugettext_lazy as _

from rest_framework import exceptions, status
from rest_framework.response import Response

# from openelite.djangoapps.enterprise_network_disk.util import code
from rest_framework.views import set_rollback

from exam_paper.utils import response_format


def custom_exception_handler(exc, context):
    """
    Returns the response that should be used for any given exception.

    By default we handle the REST framework `APIException`, and also
    Django's built-in `Http404` and `PermissionDenied` exceptions.

    Any unhandled exceptions may return `None`, which will cause a 500 error
    to be raised.
    """
    
    if isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
        else:
            data = {'detail': exc.detail}

        set_rollback()
        print 'something happen'
        return Response(response_format(status=-1, msg=exc.detail), status=exc.status_code, headers=headers)

    elif isinstance(exc, Http404):

        msg = _('Not found.')
        data = {'detail': six.text_type(msg)}

        set_rollback()
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    elif isinstance(exc, PermissionDenied):
        msg = _('Permission denied.')
        data = {'detail': six.text_type(msg)}

        set_rollback()
        return Response(data, status=status.HTTP_403_FORBIDDEN)

    # Note: Unhandled exceptions will raise a 500 error.
    logging.exception(exc)

    return None
