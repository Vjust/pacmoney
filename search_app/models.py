from django.db import models

# Create your models here.
class SearchWord(models.Model):
    search_word=models.CharField(max_length=200)


# Create your models here.
class Candidate(models.Model):
    id=models.IntegerField(primary_key=True)
    cycle_id=models.CharField(max_length=4)
    fec_cand_id=models.CharField(max_length=9)
    crp_cid=models.CharField(max_length=9)
    name_firstlast_p=models.CharField(max_length = 50)
    party=models.CharField(max_length=1)
    dist_id_runfor=models.CharField(max_length=4)
    dist_id_curr=models.CharField(max_length=4)
    curr_cand=models.CharField(max_length=1)
    cycle_cand=models.CharField(max_length=1)
    crp_ico=models.CharField(max_length=1)
    recip_code=models.CharField(max_length=2)
    no_pacs_ind=models.CharField(max_length=1)
    dummy=models.CharField(max_length=2)
    
#    def __unicode__ (self):
#        return "candidate:{0}".format(self.name_firstlast_p)
    
    class Meta:
        db_table = 'os_candidate'
        managed=False
           

class Committee(models.Model):
    id=models.IntegerField(primary_key=True)    
    cycle_id=models.CharField(max_length=4,primary_key=True)
    fec_cmte_id=models.CharField(max_length=9)
    pac_short=models.CharField(max_length=50)
    affliate=models.CharField(max_length=50)
    ultorg=models.CharField(max_length=50)
    recip_id=models.CharField(max_length=9)
    recip_code=models.CharField(max_length=2)
    fec_cand_id=models.CharField(max_length=9)
    party=models.IntegerField(max_length=1)
    prim_code=models.CharField(max_length=5)
    source_prim_code=models.CharField(max_length=20)
    sensitive_ind=models.CharField(max_length=1)
    foreign_ind=models.CharField(max_length=1)
    active_ind=models.CharField(max_length=2)
    
    def __unicode__ (self):
        return "committee:{0} ".format(self.pac_short)
        
    class Meta:
        db_table = 'os_committee'
        managed=False

class Contribution(models.Model):
    id=models.IntegerField(primary_key=True)
    
    cycle_id=models.CharField(max_length=4)
    fec_rec_no=models.CharField(max_length=19)
    pac_id=models.CharField(max_length=9)
    crp_cid=models.CharField(max_length=9)
    contribution_amt=models.DecimalField(max_digits=10,decimal_places=2)
    contribution_dt=models.CharField(max_length=20)
    crp_real_code=models.CharField(max_length=5)
    fec_trans_type=models.CharField(max_length=3)
    direct_ind=models.CharField(max_length=1)
    fec_cand_id=models.CharField(max_length=9)
    
    def __unicode__ (self):
        return "Contribution ID:{0} Amt: {1}".format(self.fec_rec_no, self.contribution_amt)
    
    class Meta:
        db_table = 'os_pac2cand'
        managed=False