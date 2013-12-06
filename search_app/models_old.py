from django.db import models

# Create your models here.
class SearchWord(models.Model):
    search_word=models.CharField(max_length=200)

from django.db import models

# Create your models here.
class Candidate(models.Model):
    cand_id=models.CharField(max_length=15,primary_key=True)
    cand_name=models.CharField(max_length=200, choices=())
    cand_pty_affiliation=models.CharField(max_length=20)
    cand_election_yr=models.IntegerField(max_length=8)
    cand_office_st=models.CharField(max_length=4)
    cand_office=models.CharField(max_length=4)
    cand_office_district=models.CharField(max_length=4)
    cand_ici=models.CharField(max_length=4)
    cand_status=models.CharField(max_length=2)
    cand_pcc=models.CharField(max_length=12)
    cand_st1=models.CharField(max_length=40)
    cand_st2=models.CharField(max_length=40)
    cand_city=models.CharField(max_length=40)
    cand_st=models.CharField(max_length=2)
    cand_zip=models.CharField(max_length=10)
    class Meta:
        db_table = 'candidate'
        managed=False
        
class NewCandidate(models.Model):
    cand_id=models.CharField(max_length=15,primary_key=True)
    cand_name=models.CharField(max_length=200, choices=())
    cand_pty_affiliation=models.CharField(max_length=20)
    cand_election_yr=models.IntegerField(max_length=8)
    cand_office_st=models.CharField(max_length=4)
    cand_office=models.CharField(max_length=4)
    class Meta:
        db_table = 'candidate'
        managed=False        

class Committee(models.Model):
    cmte_id=models.CharField(max_length=15,primary_key=True)
    cmte_nm=models.CharField(max_length=200)
    tres_nm=models.CharField(max_length=90)
    cmte_st1=models.CharField(max_length=40)
    cmte_st2=models.CharField(max_length=40)
    cmte_city=models.CharField(max_length=40)
    cmte_st=models.CharField(max_length=2)
    cmte_zip=models.CharField(max_length=10)
    cmte_dsgn=models.IntegerField(max_length=2)
    cmte_type=models.CharField(max_length=2)
    cmte_pty_affiliation=models.CharField(max_length=6)
    cmte_filing_freq=models.CharField(max_length=2)
    org_type=models.CharField(max_length=2)
    connected_org_nm=models.CharField(max_length=200)
    cand_id=models.CharField(max_length=12)
    class Meta:
        db_table = 'committee'
        managed=False

class Candidate_Committee(models.Model):
    cand=models.ForeignKey("Candidate")
    cand_election_yr=models.IntegerField(max_length=8)
    fec_election_yr=models.IntegerField(max_length=8)
    cmte=models.ForeignKey('Committee')
    cmte_type=models.CharField(max_length=2)
    cmte_dsgn=models.CharField(max_length=2)
    linkage_id=models.CharField(max_length=16,primary_key=True)
    class Meta:
        db_table = 'candidate_committee'
        managed=False

class Contribution(models.Model):
    cmte=models.ForeignKey("Committee")
    amndt_ind=models.CharField(max_length=2)
    rpt_tp=models.CharField(max_length=6)
    transaction_pgi=models.CharField(max_length=5)
    image_num=models.CharField(max_length=11)
    transaction_type=models.CharField(max_length=3)
    entity_tp=models.CharField(max_length=3)
    name=models.CharField(max_length=200)
    city=models.CharField(max_length=30)
    state=models.CharField(max_length=2)
    zip_code=models.CharField(max_length=9)
    employer=models.CharField(max_length=40)
    occupation=models.CharField(max_length=40)
    transaction_amt=models.DecimalField(max_digits=10,decimal_places=2)
    other_id=models.CharField(max_length=12)
    cand=models.ForeignKey("Candidate")
    tran_id=models.CharField(max_length=32)
    memo_txt=models.CharField(max_length=100)
    transaction_dt=models.CharField(max_length=16)
    sub_id=models.CharField(max_length=25)
    memo_cd=models.CharField(max_length=200)
    file_num=models.CharField(max_length=200, primary_key=True)
    class Meta:
        db_table = 'contribution'
        managed=False

class MV_Contribution(models.Model):
    transaction_type=models.CharField(max_length=3)
    entity_tp=models.CharField(max_length=3)
    name=models.CharField(max_length=200)
    transaction_amt=models.DecimalField(max_digits=10,decimal_places=2)
    cand=models.ForeignKey("Candidate")
    transaction_dt=models.CharField(max_length=16)
    sub_id=models.CharField(max_length=25)
    file_num=models.CharField(max_length=200, primary_key=True)
    cmte_id=models.CharField(max_length=15,primary_key=True)
    cmte_nm=models.CharField(max_length=200)
    tres_nm=models.CharField(max_length=90)
    cmte_st=models.CharField(max_length=2)
    cmte_type=models.CharField(max_length=2)
    cmte_filing_freq=models.CharField(max_length=2)
    org_type=models.CharField(max_length=2)
    connected_org_nm=models.CharField(max_length=200)
    cand_id=models.CharField(max_length=15,primary_key=True)
    cand_name=models.CharField(max_length=200, choices=())
    cand_election_yr=models.IntegerField(max_length=8)
    cand_office_district=models.CharField(max_length=4)
    cand_st=models.CharField(max_length=2)
    cand_pty_affiliation=models.CharField(max_length=20)
    class Meta:
        db_table = 'mv_contribution'
        managed=False