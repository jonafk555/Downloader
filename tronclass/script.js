function downloadPDFFile() {
  var anchorElement = document.getElementById("secondaryViewBookmark");

  // Fetch the href attribute value
  var hrefValue = anchorElement.getAttribute("href");
  
  fetch(hrefValue)
    .then(response => response.text())
    .then(htmlContent => {
      // Create a temporary element to parse the HTML content
      var tempElement = document.createElement('div');
      tempElement.innerHTML = htmlContent;

      // Find the link element in the HTML
      var linkElement = tempElement.querySelector('a');

      var linkURL = linkElement.href;

      // Extract the link from the URL
      var urlObj = new URL(linkURL);
      var link = decodeURIComponent(urlObj.searchParams.get('file'));

      console.log('Extracted Link:', link);

      // Create a link element to trigger the download
      var downloadLink = document.createElement('a');
      downloadLink.href = linkURL;
      downloadLink.download = 'downloaded.pdf'; // Specify the desired file name

      // Programmatically trigger the download
      downloadLink.click();
    })
    .catch(error => {
      console.log('Failed to fetch the HTML content:', error);
    });
}

downloadPDFFile();
