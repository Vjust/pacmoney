// on search submit
function search_submit() {
    var donor= $("#id_donor").val();
    if (donor.length > 0) {
    
        /*
            I need this data.. Whenever you get back from the server, stuff the html into this div
        */
        $("#search-results").load("/search?ajax&donor=" + encodeURIComponent(donor));
        
        var myURL = "/data/fullmap?ajax&donor=" + encodeURIComponent(donor);
        $.getJSON(myURL, function(d) {
                        fullMapHighlight(d);
            }
        );
        
        $("#error").empty();
    }
    else {
       $("#error").append(" <p class='errmsg'>Please enter name of Contributor Organization.</p>");
       $("#search-results").empty();
    }
    return false;
}

// document ready
$(document).ready(function () {
    $("#search-form").submit(search_submit);
    //$("#search-results").load("/search?ajax&donor=" + encodeURIComponent(donor));
    //alert("Press a key to submit");
    //$("#id_donor").value="obama";
    //$("#search-form").submit();
    //$("#search-results").load("/search?ajax&donor=obama");   
    
    /*
    var myURL = "/data/fullmap?ajax&donor=obama"; 
        $.getJSON(myURL, function(d) {
                        fullMapHighlight(d);
            }
       );    
       */
});
    
    