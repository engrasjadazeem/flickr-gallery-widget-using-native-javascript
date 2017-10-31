//Flickr Widget Invoker
function invokeFlickrWidget(divId, options) {
    console.log(options);
    //Visual configuration = First Impression
    applyConfiguration(divId, options);   

    //console.log('Invoke flickr widget:'+divId);
    //var divId = 'flickrWidget';
    var widget = document.getElementById(divId);
    var visibleImagesCount = widget.dataset.nbrImage;
    var imagesTopic = widget.dataset.topic;

    //Async GET Request
    var request = new XMLHttpRequest();
    var requestURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_ke'
                      + 'y=b36822a18ddea0e3bd497a333e3b696d&format=json&nojsonca'
                      + 'llback=1';
    var optionalParameters = '&per_page=' + visibleImagesCount + '&text=' + encodeURIComponent(imagesTopic.toString());

    request.open('GET', requestURL + optionalParameters, true);
    request.onload = function (e) {
        if (request.readyState === 4) {
            // Check if the get was successful.
            if (request.status === 200) {
                //Success flag
                //console.log(request.responseText);
                var data = JSON.parse(request.responseText);
                var imageList = data.photos.photo;

                //Deleted Images in particular widget
                var deletedImages = JSON.parse("[" + localStorage.getItem("Widget_" + divId) + "]");

                imageList.forEach(function (image) {
                    //If image is not deleted by the user anytime
                    if (!deletedImages.includes(image.id)) {
                        //Sample Image URL : https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
                        var imageURL = 'https://farm' + image.farm + '.staticflickr.com/' + image.server + '/' + image.id + '_' + image.secret + '.jpg';
                        var imageBox = '<div class="container" id="'+ divId +'_'+ image.id +'" >' +
                          '<img  src="' + imageURL + '" alt="Image" class="image thumbnail">' +
                          '<div class="overlay" >' +
                            '<div class="text cursor-pointer" onclick="deleteImage(\''+ divId +'_' + image.id + '\', \'' + divId + '\')"><i class="fa fa-trash fa-lg"></i></div>' +
                          '</div>' +
                        '</div>';
                        document.getElementById(divId).innerHTML += imageBox;
                    }
                });

                //Thumbnail size
                if (options.thumbnailSize !== undefined) {
                    var images = document.getElementById(divId).querySelectorAll(".thumbnail");
                    for (var i = 0; i < images.length; i++) {
                        images[i].style.width = options.thumbnailSize;
                        images[i].style.height = options.thumbnailSize;
                    }
                }

            } else {
                //Error flag
                console.error(request.statusText);
            }
        }
    };

    // Catch errors:
    request.onerror = function (e) {
        console.error(request.statusText);
    };

    request.send(null);
}


//Appearance
function applyConfiguration(divId, options) {
    if(options.width !== undefined)
        document.getElementById(divId).style.width = options.width;

    if (options.height !== undefined)
        document.getElementById(divId).style.height = options.height;

    if (options.backgroundColor !== undefined)
        document.getElementById(divId).style.backgroundColor = options.backgroundColour;
    
    if (options.enableScroll !== undefined && options.enableScroll) {
        document.getElementById(divId).style.overflowY = "scroll";
    }
    else {
        document.getElementById(divId).style.overflowY = "hidden";
    }   
}

//Delete Image handler
function deleteImage(imageRef, widgetId) {
    //console.log('Delete Image Id  = ' + imageRef);
    var deleteImageDiv = document.getElementById(imageRef);
    deleteImageDiv.parentNode.removeChild(deleteImageDiv);

    //Add to local storage
    setDeletedImage(imageRef, widgetId);
}


//Local Storage setter
function setDeletedImage(imageId, widgetId) {
    console.log(imageId);
    console.log(widgetId);

    // Check browser support
    if (typeof (Storage) !== "undefined") {
        // Store
        if (!localStorage.getItem("Widget_" + widgetId)) {
            localStorage.setItem("Widget_" + widgetId, '"'+ imageId +'"');
        } else {
            localStorage.setItem("Widget_" + widgetId, localStorage.getItem("Widget_" + widgetId) + ',' + '"'+ imageId + '"');
            //JSON.parse("[" + localStorage.getItem("Widget") + "]");
        }
    }
    else {
        document.getElementById("ErrorBrowser").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
}