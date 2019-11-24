$("button#imdbModel").on("click", function() {
	$("div#notLoggedIn").removeClass("d-none");
});

function Check_or_Uncheck() {
	var GetEmailValue = document.getElementById("emailCheckbox");
	GetEmailValue.value = GetEmailValue.checked;
}