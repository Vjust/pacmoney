from django.http import HttpResponse, Http404
from django.template import RequestContext
#the below import is needed to load AJAX:
from django.template.loader import get_template
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, InvalidPage
import json

#from influenceexplorer import *
from forms import *
from models import *

# from search_app.constants import get_choice

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
                my_search = MV_Contribution.objects.filter(name__icontains=my_donor)
  
            if not my_search:
                show_result = True
                null_result = True
                variables = RequestContext(request, {'my_donor': my_donor, 'show_result':show_result, 'null_result': null_result})
                return render_to_response('search_results.html', variables)
            else:
                # search results were found
                if ajax:
                    show_result = True
                    result_list= []
                    for each_search in my_search:
                        result_dict={}
                        result_dict['cmte_name'] = each_search.cmte_nm
                        result_dict['transaction_amt'] = each_search.transaction_amt
                        result_dict['cand_st']= each_search.cand_st
                        result_dict['cand_name']=each_search.cand_name
                        result_dict['cand_pty_affiliation']=each_search.cand_pty_affiliation
                        result_dict['name'] = each_search.name
                        #result_dict['org_type'] = each_search.org_type
                        result_dict['district_number'] = each_search.cand_office_district
                        result_dict['district_id'] = each_search.cand_st + '-' + each_search.cand_office_district

                        result_list.append(result_dict)

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
                                                         'my_search': my_search,
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
    
def fullmap_view(request):
    my_donor=request.GET['donor'].strip()

# maybe : build a logic for donor = ALL           
        
    my_search = MV_Contribution.objects.distinct('cand_office_district', 'cand_st').filter(name__icontains=my_donor).order_by('cand_st', 'cand_office_district')
    # search results were found
    json_list= []
    for i in my_search:
        mydict={}
        mydict['district_id'] = i.cand_st + '-' + i.cand_office_district
        mydict['transaction_amt'] = i.transaction_amt
        json_list.append(mydict)
       
    return HttpResponse(json.dumps(json_list), mimetype='application/json')
    #variables = RequestContext(request, {'json_list': json_list,})
        #return render_to_response('search.html', 'district_map.html', variables)



def district_data_json(request):

    district_id = request.GET['district_id']
    cand_state_id, district_num = district_id.split('-')
    my_search = MV_Contribution.objects.filter(cand_office_district = district_num, cand_st = cand_state_id)            
    json_data=[]
    
    for i in my_search:
        mydict={}
        mydict['cmte_nm'] = i.cmte_nm
        mydict['cand_name'] = i.cand_name
        mydict['cand_st'] = i.cand_st
        mydict['cand_pty_affiliation'] = i.cand_pty_affiliation
        mydict['transaction_amt'] = i.transaction_amt
        json_data.append(mydict)

    return HttpResponse(json.dumps(json_data), mimetype='application/json')    

def map_view(request):
    return render_to_response(
        'district_map.html',
        RequestContext(request))

def json_populate(request, result_list):
    return result_list

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
