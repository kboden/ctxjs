/*
 * File:        ctxProject.js
 * Version:     1.0.0
 * Description: ctxProject for Google Apps Script
 * Author:      Kristof Boden (www.cogetix.com)
 * Created:     Thu  4 Apr 2013 21:55:41 GMT+1
 * Modified:    $Date$ by $Author$
 * Language:    Javascript
 * Project:     ctxProject
 * Contact:     www.cogetix.com/contact
 * 
 * Copyright 2013 Cogetix, all rights reserved.
 *
 *
 */

var properties;
var bRegex;
var bSmart;
var j;

window.refreshDataTable = function(dataTableId) {
    var dataTable = $('#' + dataTableId).dataTable();
    var oTT = TableTools.fnGetInstance( dataTableId );
    oTT.fnSelectNone();
    $(dataTable).hide();
    $(".dataTables_info").hide();
    $(".dataTables_paginate").hide();
    $(".dataTables_processing").css("display", "inline");
    window.getLabelValuePairs();
    google.script.run.withSuccessHandler(function(data) {
    	var t = $('#' + dataTableId).DataTable();
    	var p = t.page();
        dataTable.fnClearTable();
        dataTable.fnAddData(data);
        t.page(p).draw(false);
        dataTable.show("clip", {}, 500);
        $(".dataTables_info").show();
        $(".dataTables_paginate").show();
        $(".dataTables_processing").css("display", "none");
    } ).getData(false);
    google.script.run.withSuccessHandler(function(data) { 
        $("#context").html(data);
    } ).getContext();
    window.getDefaults();
}

window.onRefreshClick = function(nButton, oConfig, oFlash) {
    if (!$(nButton).hasClass('DTTT_disabled')) {
        var dataTableId = $(nButton).attr('id').split('_')[1];
        window.refreshDataTable(dataTableId)
    }
}

window.formatDate = function(data) {
    if (data == null || data.length === 0) {
        return data;
    }
    var vDate = new Date(data);
    //return vDate.getDate() + '-' + (vDate.getMonth() + 1) + '-' + vDate.getFullYear();
    return vDate.toDateString();
}

window.formatTimestamp = function(data) {
    if (data == null || data.length === 0) {
        return data;
    }
    var vDate = new Date(data);
    return vDate.getUTCDate() + '-' + (vDate.getUTCMonth() + 1) + '-' + vDate.getUTCFullYear() + ' ' + vDate.getUTCHours() + ':' + vDate.getUTCMinutes() + ':' + vDate.getUTCSeconds();
}

window.initApp = function() {
    $( "#dialog-message" ).dialog({
        autoOpen: false,
        width: 400,
        modal: true,
        position: { my: "center top+10%", at: "center top+10%", of: window },
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });
    
    // Custom select field type
    $.fn.DataTable.Editor.fieldTypes.customselect = $.extend( true, {}, $.fn.DataTable.Editor.models.fieldType, {
        "create": function ( conf ) {
            var that = this;

            conf._enabled = true;
            
            if (conf.ipOpts == undefined) {
                conf.ipOpts = [];
            }
            
            var html = '<select id="' + conf.id + '">';
            for ( var i=0, iLen=conf.ipOpts.length ; i<iLen ; i++ ) {
                html += '<option value="' + conf.ipOpts[i].val + '">' + conf.ipOpts[i].label + '</option>';
            }
            html += '</select>';
     
            // Create the elements to use for the input
            conf._input = $(html)[0];
     
            return conf._input;
        },
    
        "update": function ( conf, ipOpts ) {
            // Get the current value
            var currVal = $(conf._input).val();
            
            conf.ipOpts = ipOpts;
            
            $(conf._input).children().remove();
            
            for ( var i=0, iLen=conf.ipOpts.length ; i<iLen ; i++ ) {
                $(conf._input).append($('<option></option>').val(conf.ipOpts[i].val).html(conf.ipOpts[i].label));
            }

            // Set the old value, if it exists
            $(conf._input).val( currVal );
        },
        
        "get": function ( conf ) {
            return $(conf._input).val();
        },
    
        "set": function ( conf, val ) {
            $(conf._input).val( val );
            $(conf._input).trigger('change');
        },
    
        "enable": function ( conf ) {
            $(conf._input).prop( 'disabled', false );
        },
    
        "disable": function ( conf ) {
            $(conf._input).prop( 'disabled', true );
        }
    } );
    
    // HTML5 date field
    $.fn.DataTable.Editor.fieldTypes.customdate = $.extend( true, {}, $.fn.DataTable.Editor.models.fieldType, {
        "create": function ( conf ) {
            conf._input = $('<input type="date"/>').attr( $.extend( {
                id: conf.id
            }, conf.attr || {} ) )[0];
        
            return conf._input;
        },
        
        "get": function ( conf ) {
            return $(conf._input).val();
        },
        
        "set": function ( conf, val ) {
            $(conf._input).val( val );
        },
        
        "enable": function ( conf ) {
            $(conf._input).prop( 'disabled', false );
        },
        
        "disable": function ( conf ) {
            $(conf._input).prop( 'disabled', true );
        }
    } );
		
	// HTML5 datetime field
    $.fn.DataTable.Editor.fieldTypes.customtimestamp = $.extend( true, {}, $.fn.DataTable.Editor.models.fieldType, {
        "create": function ( conf ) {
            conf._input = $('<input type="datetime-local"/>').attr( $.extend( {
                id: conf.id
            }, conf.attr || {} ) )[0];
        
            return conf._input;
        },
        
        "get": function ( conf ) {
            return $(conf._input).val();
        },
        
        "set": function ( conf, val ) {
            $(conf._input).val( val );
        },
        
        "enable": function ( conf ) {
            $(conf._input).prop( 'disabled', false );
        },
        
        "disable": function ( conf ) {
            $(conf._input).prop( 'disabled', true );
        }
    } );
    
    // HTML5 time field
    $.fn.DataTable.Editor.fieldTypes.customtime = $.extend( true, {}, $.fn.DataTable.Editor.models.fieldType, {
        "create": function ( conf ) {
            conf._input = $('<input type="time"/>').attr( $.extend( {
                id: conf.id
            }, conf.attr || {} ) )[0];
        
            return conf._input;
        },
        
        "get": function ( conf ) {
            return $(conf._input).val();
        },
        
        "set": function ( conf, val ) {
            $(conf._input).val( val );
        },
        
        "enable": function ( conf ) {
            $(conf._input).prop( 'disabled', false );
        },
        
        "disable": function ( conf ) {
            $(conf._input).prop( 'disabled', true );
        }
    } );
}

window.createEditor = function() {
    var editor = new $.fn.dataTable.Editor( {
        "domTable": "#dataTable",
        "idSrc": "id",
        "ajax": function ( method, url, data, successCallback, errorCallback ) {
            var id = -1;
 
            if ( data.action === 'create' ) {
                google.script.run
                    .withFailureHandler(function(xhr, error, thrown) {
                    	if (xhr) {
                    	   alert(xhr.message);
                    	}
                        errorCallback(xhr, error, thrown);
                    })
                    .withSuccessHandler( function(record) {
                        successCallback({"id": record.id, "row": record});
                    } )
                    .insertRecord(data.data);
            }
            else if ( data.action === 'edit' ) {
                google.script.run
                    .withFailureHandler(function(xhr, error, thrown) {
                    	if (xhr) {
                    	   alert(xhr.message);
                    	}
                        errorCallback(xhr, error, thrown);
                    })
                    .withSuccessHandler( function(record) {
                        successCallback({"id": record.id, "row": record});
                    } )
                    .updateRecord(data.id, data.data);
            }
            else if ( data.action === 'remove' ) {
                google.script.run
                    .withFailureHandler(function(xhr, error, thrown) {
                    	if (xhr) {
                    	   alert(xhr.message);
                    	}
                        errorCallback(xhr, error, thrown);
                    })
                    .withSuccessHandler( function() {
                        successCallback({});
                    } )
                    .deleteRecords(data.id);
            }
        },
        "i18n": {
            "create": {
                "button": "Nieuw",
                "title":  "Record aanmaken",
                "submit": "Opslaan"
            },
            "edit": {
                "button": "Bewerken",
                "title":  "Record bewerken",
                "submit": "Opslaan"
            },
            "remove": {
                "button": "Verwijderen",
                "title":  "Record verwijderen",
                "submit": "Verwijderen",
                "confirm": {"_": "Wilt u %d records verwijderen?", "1": "Wilt u %d record verwijderen?"}
            },
            "error": {
                "system": "Er is een fout opgetreden."
            }
        }
    } );
    
    editor.on('onOpen', function() {
        $('.DTE_Body_Content').css('max-height', '');
    } );
    
    return editor;
};

window.configureTable = function(dataTableId) {
    $("#" + dataTableId).on("page", function() {
        var oTT = TableTools.fnGetInstance( dataTableId );
        oTT.fnSelectNone();
    } );
} 
