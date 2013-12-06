import os
from django.conf.urls import patterns, include, url
from django.views.generic.base import TemplateView
from django.conf import settings    
from django.views.static import serve
from views import *

data_dir = os.path.join(os.path.dirname(__file__), 'data')
print "Data dir %s" % data_dir

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('search_app.views',
    # Main
    url(r'/test', test_page),
    url(r'/distjson', district_data_json),    
    url(r'/cont', contribution_view),
    url(r'/fullmap', fullmap_view),    
    # site 
    # (r'javascripts/(?P<path>.*)$', serve,
            # {'document_root': data_dir}),
    (r'(?P<path>.*)$', serve,
            {'document_root': data_dir}),

    # (r'^/data/(?P<json_file>.*json)$', json_file),


    
)
