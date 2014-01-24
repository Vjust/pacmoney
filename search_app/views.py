""" Views for the search_app application
"""
from django.http import HttpResponse
from django.http import Http404
from django.template import RequestContext

#the below import is needed to load AJAX:
from django.template.loader import get_template
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.core.paginator import InvalidPage
import json

from forms import *
from models import *
from helpers import *



def main_page(request):
    """
	:param request:
	:return:
	"""
    return render_to_response(
        'main.html',
        RequestContext(request))


def about_page(request):
    """

	:param request:
	:return:
	"""
    return render_to_response(
        'about.html',
        RequestContext(request))


def search_page(request):
    """	:param request:
	:return:
	"""
    show_result = False
    error_msg = False
    null_result = False
    ajax = 'ajax' in request.GET
    if 'donor' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            my_donor = form.cleaned_data['donor']
            my_donor=request.GET['donor'].strip()
           
            if my_donor:	
                form=SearchForm({'my_donor':my_donor})
                result_list = process_donor(my_donor)
  
            if not result_list:
                show_result = True
                null_result = True
                variables = RequestContext(request, {'my_donor': my_donor, 'show_result':show_result, 'null_result': null_result})
                return render_to_response('search_results.html', variables)
            else:
                # search results were found
                if ajax:
                    show_result = True
                    #sending this as parameter to the function
                    json_populate(request, result_list)

                    # #pagination
                    ITEMS_PER_PAGE = 10

                    #result_set = my_search.order_by('name')

                    result_set = result_list
                    paginator = Paginator(result_set,ITEMS_PER_PAGE)
                    try:
                        page_number = int(request.GET['page'])
                    except (KeyError, ValueError):
                        page_number = 1
                    try:
                        page = paginator.page(page_number)
                    except InvalidPage:
                        raise Http404
                    # my_search = page.object_list
                    result_list = page.object_list


                    variables = RequestContext(request, {'form': form,
                                                         'my_donor': my_donor,
                                                         #'my_search': my_search,
                                                         'result_list': result_list,
                                                         'show_result': show_result,
                                                         'show_paginator': paginator.num_pages > 1,
                                                         'has_prev': page.has_previous(),
                                                         'has_next': page.has_next(),
                                                         'page': page_number,
                                                         'pages': paginator.num_pages,
                                                         'next_page': page_number + 1,
                                                         'prev_page': page_number - 1
                                                        })

                    if 'page' in request.GET:
                        return render_to_response('search.html', 'search_results.html', variables)
                    else:
                        return render_to_response('search_results.html',  variables)
                else:
                    form = SearchForm()
                    msg = 'Ajax fails'
                    variables = RequestContext(request, {'form': form, 'msg':msg})
                    return render_to_response('search.html', variables)
        else:
            error_msg = True
            variables = RequestContext(request, {'form': form,'error_msg': error_msg})
            return render_to_response('search.html', variables)
    else:
        form = SearchForm()
        variables = RequestContext(request, {'form': form})
        return render_to_response('search.html', variables)
    
    
def process_donor2(my_donor):
    search_committee = Committee.objects.filter(pac_short__icontains = my_donor)
    contributions = search_committee.contribution_set
    
       
def process_donor(my_donor):
    """ Returns a Json object after applying donor criteria
    """
 
    where_str = "upper(pac_short) like upper('%%{0}%%') ".format(my_donor)    
    search_contribution = Contribution.objects.select_related('pac_donor').extra (where = [where_str])
    json_list= []
    for pac_contribution in search_contribution:
        mydict={}
        state_id,district_id=split_district_state(pac_contribution.candidate.dist_id_runfor)
        mydict.setdefault('district_id', state_id + '-' + district_id)
        mydict.setdefault('cand_st', state_id )
        mydict.setdefault('district_number',  district_id)
        mydict.setdefault('transaction_amt', pac_contribution.contribution_amt)
        mydict.setdefault('cand_name', pac_contribution.candidate.cand_name)
        mydict.setdefault('cand_party', pac_contribution.candidate.party)
        mydict.setdefault('cand_pty_affiliation', pac_contribution.candidate.party)        
        mydict.setdefault('cmte_name', pac_contribution.pac_donor.pac_short)
        json_list.append(mydict)
        
    return json_list
    
    
def fullmap_view(request):
    my_donor=request.GET['donor'].strip()
    json_list= process_donor(my_donor)
    return HttpResponse(json.dumps(json_list), mimetype='application/json')



def district_data_json(request):
    """ Returns data for a district, when clicked on the Map
    """

    cand_state_id, district_id = split_district_state(request.GET['district_id'])
    where_str = "dist_id_runfor = '{0}' ".format(cand_state_id+district_id )    
    search_contribution = Contribution.objects.select_related('candidate').extra (where = [where_str])
    json_data=[]
    
    for pac_contribution in search_contribution:
        mydict={}
        mydict.setdefault('cand_st', cand_state_id )
        mydict.setdefault('district_number',  district_id)
        mydict.setdefault('transaction_amt', pac_contribution.contribution_amt)
        mydict.setdefault('cand_name', pac_contribution.candidate.cand_name)
        mydict.setdefault('cand_party', pac_contribution.candidate.party)
        mydict.setdefault('cand_pty_affiliation', pac_contribution.candidate.party)        
        mydict.setdefault('cmte_name', pac_contribution.pac_donor.pac_short)        
        json_data.append(mydict)

    return HttpResponse(json.dumps(json_data), mimetype='application/json')    

def map_view(request):
    return render_to_response(
        'district_map.html',
        RequestContext(request))

def json_populate(request, result_list):
    return result_list

#
def contribution_view(request):
    json_data= """[{"contributor": {
        "district": "08",
        "contributor_name": "CORRECTIONS CORP OF AMERICA", "contributor_type": {
            "Corporation": {
                "organization_name": "CORRECTIONS CORP OF AMERICA", "organization_ext_id": "695", "parent_organization_ext_id": "", "transaction": {
                    "is_amendment": false, "amount": "50000.00", "transaction_type_description": "", "transaction_namespace": "urn:nimsp:transaction", "date": "2012-03-05", "filing_id": "", "Recipient": {
                        "recipient_ext_id": "11807", "recipient_party": "I", "district": {
                            "district": "CA-08", "seat_result": "", "district_held": "", "seat": "", "seat_held": "", "seat_status": ""
                        },
                        "recipient_type": "C", "recipient_state": "CA", "recipient_category": "", "recipient_state_held": "", "recipient_name": "CALIFORNIANS TO PROTECT SCHOOLS UNIVERSITIES & PUBLIC SAFETY"
                    },
                    "transaction_id": "c77df6c7d61539ca067d4120cefc1e14", "transaction_type": ""
                }, "parent_organization_name": ""
            }}, "contributor_ext_id": "695"
    }}
    ]"""
    return HttpResponse(json_data, mimetype='application/json')

def test_page(request):
    """
    :param request:
    :return:
    """
    return render_to_response(
        'test_page.html',
        RequestContext(request))

def url_test(request, path, **kwargs):
    """
    :param request:
    :return:
    """
    print "in url test "
    for kee,vaal in kwargs.items():
        print kee,vaal

    return render_to_response(
        'test_page.html',
        RequestContext(request))
