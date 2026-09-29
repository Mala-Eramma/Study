// =========================================
// SHOW DOWNLOAD BUTTON
// =========================================

function showDownloadButton() {

    if (
        !downloadSummaryButton
    ) {

        downloadSummaryButton =
            document.createElement(
                "button"
            );

        downloadSummaryButton.type =
            "button";

        downloadSummaryButton.id =
            "downloadSummaryButton";

        downloadSummaryButton.textContent =
            "Download AI Summary";

        downloadSummaryButton.style.marginTop =
            "20px";

        downloadSummaryButton.style.padding =
            "12px 22px";

        downloadSummaryButton.style.backgroundColor =
            "darkblue";

        downloadSummaryButton.style.color =
            "white";

        downloadSummaryButton.style.border =
            "none";

        downloadSummaryButton.style.borderRadius =
            "8px";

        downloadSummaryButton.style.cursor =
            "pointer";

        downloadSummaryButton.style.fontSize =
            "15px";

        downloadSummaryButton.style.fontWeight =
            "600";

        materialContent.appendChild(
            downloadSummaryButton
        );

    }

    downloadSummaryButton.onclick =
        downloadAISummary;

    downloadSummaryButton.style.display =
        "block";

}