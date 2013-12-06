from django.conf import settings    
from django.conf.urls import patterns, include, url
from django.core.context_processors import csrf
from django.core import management
from django.core import validators
from django.core.management import execute_from_command_line
from django.core.paginator import Paginator, InvalidPage
from django.core.wsgi import get_wsgi_application
from django.db import models
from django.http import HttpResponse, Http404
from django import forms
from django.shortcuts import get_object_or_404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import get_template
from django.test import TestCase
from django.views.generic.base import TemplateView
from django.views.static import serve
from forms import *
from models import *
from search_app.views import *
from views import *
import json
import os
import os.path
import os,sys
import site
import sys
