# -*- coding:utf-8 -*-
from __future__ import unicode_literals


def response_format(data=None, msg='success', status=0):
    """
    :param data: reponse data
    :param msg: reponse message
    :param status: reponse status
    :return: dict
    """
    return {
        'status': status,
        'message': msg,
        'data': data
    }
