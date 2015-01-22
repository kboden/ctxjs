/*
 * File:        ctxProject.js
 * Version:     1.0.0
 * CVS:         $Id$
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
 
 // Apps Script Callback functions
function onGetData(output) {
    /*$('#listView').html(output.html);*/
    $("#listView").show("clip", {}, 500).css('overflow', 'visible');
    $('.ctxRow').hide();
    $('.ctxSelectCheckBox').attr('checked',false);
    $('.ctxRow').each(function(i, obj) {
        if (i < output.data.length) {
            $(obj).find('.ctxColumn').each(function(j, col) {
                $(col).html(output.data[i][j]);
            });
            $(obj).show();
        }
    });
    $('#ctxInfoRecords').html(output.outputRows);
    $('#ctxInfoDate').html(output.outputDate);
    $("#infobar").show();
    $('#actionbar').show();
    $("#ctxStatus").hide();
    $('#ctxDataTable tbody tr .clickToEdit').click(onRowClick);
    $('#ctxBtPrevPage').prop('disabled', output.firstPage).toggleClass('disabled', output.firstPage);
    $('#ctxBtNextPage').prop('disabled', output.lastPage).toggleClass('disabled', output.lastPage);
}
      
function onEdit(output) {
    $('#editView').html(output);
    $("#editView").show().css('overflow', 'visible');
    $('#ctxCancelEdit').click(onCancelClick);
    $('.ctxInput').change(onInputChange);
    $('#ctxSave').click(onSaveClick);
    $(".datepicker").datepicker({ dateFormat: "dd-mm-yy" });
    $("#ctxStatus").hide();
}

// Event handlers
function onRowClick() {
    $("#ctxStatus").show();
    $("#infobar").hide();
    $('#actionbar').hide();
    $('#listView').hide();
    var recordId = $(this).closest('tr').find('.ctxColumn_id').html();
    google.script.run.withFailureHandler(handleError).withSuccessHandler(onEdit).getEditForm(recordId, $('#ctxFilter0').find('option:selected').val());
}

function onCancelClick() {
    checkChanges(cancelEdit);
}

function onInputChange() {
    $(this).addClass('ctxInputChanged');
}

function onSaveClick() {
    var inputValues = {};
    $('.ctxMandatory').each(function(i, obj) {
        $(obj).toggleClass('ctxInputError', ($(obj).val().length === 0));
    });
    if ($('.ctxInputError').length > 0) {
      showAlert('Verplichte velden moeten ingevuld worden.');
      return;
    }
    $('.ctxInputChanged').each(function(i, obj) {
        switch($(obj).attr('type')) {
            case 'checkbox':
                inputValues[$(obj).attr('name')] = $(obj).is(':checked');
                break;
            default:
                inputValues[$(obj).attr('name')] = $(obj).val();
        }
    });
    google.script.run.withFailureHandler(handleError).withSuccessHandler(getData).saveRecord($('#ctxRecordId').val(), inputValues);
}

function onSearchKeyup(e) {
    if(e.keyCode == 13) {
      checkChanges(load);
    }
}

function onNavClick() {
    var step = ($(this).val()==">"?1:-1);
    navigatePages(step);
}

function onCreateClick() {
    $("#ctxStatus").show();
    $("#infobar").hide();
    $('#actionbar').hide();
    $('#listView').hide();
    google.script.run.withFailureHandler(handleError).withSuccessHandler(onEdit).getEditForm(-1, $('#ctxFilter0').find('option:selected').val());
} 

function onDeleteClick() {
    if ( $('.ctxSelectCheckBox:checked').length === 0 ) {
      showAlert("Geen rijen geselecteerd.");
      return;
    }
    showDialog("Selectie verwijderen", "Wilt u de geselecteerde rijen verwijderen?", deleteRecords);
}

function onRefreshClick() {
    checkChanges(reload);
}

function onTitleClick() {
    checkChanges(load);
}

// Custom functions
function cancelEdit() {
    $('#editView').html('').hide();
    $("#listView").show("clip", {}, 500).css('overflow', 'visible');
    $("#infobar").show();
    $('#actionbar').show();
}

function checkChanges(paramFunc) {
    if ($('.ctxInputChanged').length > 0) {
      showDialog("Wijzigingen annuleren", "Wilt u de wijzigingen ongedaan maken zonder te bewaren?", paramFunc);
    } else {
      paramFunc();
    }
}

function showAlert(e) {
    $('#ctxAlert').html('<span>' + e + '</span>').show().delay(5000).fadeOut();
}

function showDialog(title, msg, paramFunc) {
    $("#dialog-message").attr('title', title).html('<p>'+msg+'</p>').dialog({
      modal: true,
      buttons: {
        Ja: function() {
          $(this).dialog("close");
          paramFunc();
        },
        Nee: function() {
          $(this).dialog("close");
        }
      },
      open: function() { 
        $(this).parents('.ui-dialog').find('.ui-dialog-buttonpane button:eq(1)').focus();
        $(this).parents('.ui-dialog').find('.ui-dialog-buttonpane button:eq(0)').blur();
      }
    });
}

function handleError(e) {
    showAlert(e);
    $("#ctxStatus").hide();
}

function getFilterValues() {
    var filterValues = [];
    $('.ctxFilterSelect').each(function(i, obj) {
      filterValues.push($(obj).find('option:selected').val());
    });
    $('.ctxFilterValueCheck').each(function(i, obj) {
      filterValues.push($(obj).is(':checked')?$(obj).val():'%');
    });
    $('.ctxFilterCheck').each(function(i, obj) {
      filterValues.push($(obj).is(':checked'));
    });
    
    return filterValues;
}

function getOrderBy() {
    var orderBy = {
      sortColumn: $('#ctxSort').find('option:selected').val(),
      sortOrder: $('#ctxSortOrder').is(':checked')?'asc':'desc'
    };
    
    return orderBy;
}

function getData() {
    $("#ctxStatus").show();
    $('#listView').hide();
    $('#infobar').hide();
    $('#editView').html('').hide();
    google.script.run.withFailureHandler(handleError).withSuccessHandler(onGetData).getData(getFilterValues(), $('#ctxSearch').val(), getOrderBy(), $('#ctxPageId').val());
}

function load() {
    $('#ctxPageId').val('1');
    getData();
}

function reload() {
    getData();
}

function initFilters() {
    $('.ctxFilter').change(function() {
      checkChanges(load);
    });
}

function initSorters() {
    $('.ctxSorter').change(function() {
      checkChanges(load);
    });
}

function deleteRecords() {
    $("#ctxStatus").show();
    var recordIds = [];
    $('.ctxSelectCheckBox').each(function(i, obj) {
      if ( $(obj).is(':checked') ) {
        recordIds.push($(obj).closest('tr').find('.ctxColumn_id').html());
      }
    });
    google.script.run.withFailureHandler(handleError).withSuccessHandler(getData).deleteRecords(recordIds);
}



function navigatePages(step) {
    var v = parseInt($('#ctxPageId').val()) + step;
    $('#ctxPageId').val(v);
    getData();
}

$(document).ready(function() {        
    getData();
    
    initFilters();
    
    initSorters();
    
    $('#ctxSearch').keyup(onSearchKeyup);
    $('#ctxBtPrevPage').click(onNavClick);
    $('#ctxBtNextPage').click(onNavClick);
    $('#ctxBtRefresh').click(onRefreshClick);
    $('#titlebar').click(onTitleClick);
    $('#ctxBtCreate').click(onCreateClick);
    $('#ctxBtDelete').click(onDeleteClick);
});