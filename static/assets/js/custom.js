$(document).ready(function() {
    $("#loginModal").on("show.bs.modal", function() {
        $("body").removeClass("modal-open")
    }),$("#registerClientModal").on("show.bs.modal", function() {
        $("body").removeClass("modal-open")
    }), $("#signupModal").on("show.bs.modal", function() {
        $("body").removeClass("modal-open")
    }), $("#loginModal").on("shown.bs.modal", function() {
        $("body").removeClass("modal-open")
    }), $("#registerClientModal").on("shown.bs.modal", function() {
        $("body").removeClass("modal-open")
    }), $("#signupModal").on("shown.bs.modal", function() {
        $("body").removeClass("modal-open")
    }), $(".collapse").on("show.bs.collapse", function() {
        $(this).parent(".card").addClass("active"), $(this).parent(".card").children().find(".accordian-icon").attr("src", "/static/assets/img/details/minus-icon.svg")
    }), $(".collapse").on("hide.bs.collapse", function() {
        $(this).parent(".card").removeClass("active"), $(this).parent(".card").children().find(".accordian-icon").attr("src", "/static/assets/img/details/plus-icon.svg")
    })
}), $(".btn-number").click(function(e) {
    e.preventDefault(), fieldName = $(this).attr("data-field"), type = $(this).attr("data-type");
    var a = $("input[name='" + fieldName + "']"),
        t = parseInt(a.val());
    isNaN(t) ? a.val(0) : "minus" == type ? (t > a.attr("min") && a.val(t - 1).change(), parseInt(a.val()) == a.attr("min") && $(this).attr("disabled", !0)) : "plus" == type && (t < a.attr("max") && a.val(t + 1).change(), parseInt(a.val()) == a.attr("max") && $(this).attr("disabled", !0))
}), $(".input-number").focusin(function() {
    $(this).data("oldValue", $(this).val())
}), $(".input-number").change(function() {
    minValue = parseInt($(this).attr("min")), maxValue = parseInt($(this).attr("max")), valueCurrent = parseInt($(this).val()), name = $(this).attr("name"), valueCurrent >= minValue ? $(".btn-number[data-type='minus'][data-field='" + name + "']").removeAttr("disabled") : (alert("Sorry, the minimum value was reached"), $(this).val($(this).data("oldValue"))), valueCurrent <= maxValue ? $(".btn-number[data-type='plus'][data-field='" + name + "']").removeAttr("disabled") : (alert("Sorry, the maximum value was reached"), $(this).val($(this).data("oldValue")))
}), $(".input-number").keydown(function(e) {
    -1 !== $.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) || 65 == e.keyCode && !0 === e.ctrlKey || e.keyCode >= 35 && e.keyCode <= 39 || (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) && e.preventDefault()
}), $(function() {
    $(".msg-wrap").slice(0, 5).show(), $("#notification-load").click(function(e) {
        e.preventDefault(), $(".msg-wrap:hidden").slice(0, 3).show(), 0 == $(".msg-wrap:hidden").length && alert("No more divs")
    })
}), $(function() {
    $(".mark-tab").slice(0, 9).show(), $("#mark-load").click(function(e) {
        e.preventDefault(), $(".mark-tab:hidden").slice(0, 3).show(), 0 == $(".mark-tab:hidden").length && alert("No more divs")
    })
}), $(function() {
    $(".img-box").slice(0, 12).show(), $("#photo-load").click(function(e) {
        e.preventDefault(), $(".img-box:hidden").slice(0, 4).show(), 0 == $(".img-box:hidden").length && alert("No more divs")
    })
}), $(function() {
    $(".review-box").slice(0, 5).show(), $("#review-load").click(function(e) {
        e.preventDefault(), $(".review-box:hidden").slice(0, 2).show(), 0 == $(".review-box:hidden").length && alert("No more divs")
    })
}), $("#accordion_tab").on("hide.bs.collapse show.bs.collapse", e => {
    $(e.target).prev().find("i:last-child").toggleClass("plus-icon fa-minus")
});