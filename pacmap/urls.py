import os
from django.conf.urls import patterns, include, url
from search_app.views import *
from django.views.generic.base import TemplateView
from django.views.static import serve



javascripts = os.path.join(os.path.dirname(__file__), 'javascripts')
stylesheets = os.path.join(os.path.dirname(__file__), 'stylesheets')


# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Main
    url(r'^$', main_page),
    url(r'^about/$', about_page),
    url(r'^search/$', search_page),
    url(r'^map/', map_view),


    url(r'^data', include("search_app.urls")),
     # Ajax
    # url(r'^pacmap/', include('pacmap.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    
    # site media
    (r'^javascripts/(?P<path>.*)$', serve,
     {'document_root': javascripts}),
    
    # stylesheets
    (r'^stylesheets/(?P<path>.*)$', serve,
     {'document_root': stylesheets}),    
    
)
