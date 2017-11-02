//Flickr Widget Invoker
function invokeFlickrWidget(divId, options) {
    console.log(options);
    //Visual configuration = First Impression
    applyConfiguration(divId, options);   

    //console.log('Invoke flickr widget:'+divId);
    //var divId = 'flickrWidget';
    
    //Async GET Request
    //Type Description
    //0 -> Initialize
    //1 -> Load only one image
    //2 -> Load more
    fetchFromFlickrAPI(divId, options.thumbnailSize, 0);

    //Remove at end
    ////Apply thumbnail size
    //if (options.thumbnailSize !== undefined) {
    //    applyThumbnailSize(divId, options.thumbnailSize);
    //}    
}


//Flickr API
function fetchFromFlickrAPI(divId, thumbnailSize, actionType) {

    var widget = document.getElementById(divId);
    var visibleImagesCount = widget.dataset.nbrImage;
    var imagesTopic = widget.dataset.topic;
    if (thumbnailSize == null) {
        //Default
        thumbnailSize = "140px";
    }

    //Special case for type "LoadOne"
    if (actionType == 1)
        visibleImagesCount = 10; //Keeping 9 extra photos incase the photo we fetched was already deleted by user

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
                //Success flag: Loader for the first time
                //console.log(request.responseText);
                var data = JSON.parse(request.responseText);
                var imageList = data.photos.photo;

                //Deleted Images in particular widget
                var deletedImages = JSON.parse("[" + localStorage.getItem("Widget_" + divId) + "]");                

                for (var i = 0; i < imageList.length; i++) {
                    var image = imageList[i];

                    //If image is not deleted by the user anytime
                    if (!deletedImages.includes(image.id)) {
                        //if(That is image is already not visible)
                        if (document.querySelector("#" + divId + "_" + image.id) != null) {
                            continue;
                        }

                        //Sample Image URL : https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
                        var imageURL = 'https://farm' + image.farm + '.staticflickr.com/' + image.server + '/' + image.id + '_' + image.secret + '.jpg';
                        var imageBox = '<div class="container" id="' + divId + '_' + image.id + '" >' +
                          '<img  src="' + imageURL + '" alt="Image" class="image thumbnail">' +
                          '<div class="overlay" >' +
                            '<div class="text cursor-pointer" onclick="deleteImage(\'' + divId + '_' + image.id + '\', \'' + divId + '\', \'' + thumbnailSize
                             + '\')"><i class="fa fa-trash fa-lg"></i></div>' +
                          '</div>' +
                        '</div>';
                        document.getElementById(divId).innerHTML += imageBox;

                        
                        if(actionType == 1){
                            //1 -> Load One
                            //Add one Image that is not deleted and break loop
                            break;
                        }                                                                        
                    }
                    
                }

                //Apply thumbnail size
                if (thumbnailSize !== undefined) {
                    applyThumbnailSize(divId, thumbnailSize);
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

function applyThumbnailSize(divId, thumbnailSize) {
    //Thumbnail size    
    var images = document.getElementById(divId).querySelectorAll(".thumbnail");
    for (var i = 0; i < images.length; i++) {
        images[i].style.width = thumbnailSize;
        images[i].style.height = thumbnailSize;
    }    
}

//Delete Image handler
function deleteImage(imageRef, divId, thumbnailSize) {
    //console.log('Delete Image Id  = ' + imageRef);
    var deleteImageDiv = document.getElementById(imageRef);
    deleteImageDiv.parentNode.removeChild(deleteImageDiv);

    //Add to local storage
    setDeletedImage(imageRef.split('_')[1], divId);

    //Fetch a new image to replace deleted image
    fetchFromFlickrAPI(divId, thumbnailSize, 1);

    //Remove at end
    //if (thumbnailSize !== undefined) {
    //    applyThumbnailSize(divId, thumbnailSize);
    //}
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

//Widget scroller
function WidgetScrolled(divId) {
    var myDiv = document.getElementById(divId);
    if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
        //scrolledToBottom(e);
        console.log("Touched ground!");

        //Block UI
        loadBlockUI(divId);

        //Default
        var thumbnailSize = "140px";
        if (document.getElementById(divId).querySelector(".thumbnail") != null) {
            thumbnailSize = document.getElementById(divId).querySelector(".thumbnail").style.width;
        }

        //Load more images event call
        fetchFromFlickrAPI(divId, thumbnailSize, 2);

    } else {
        console.log("Not yet!");        
    }
}

//Block UI
function loadBlockUI(divId) {
    var blockUI = document.createElement("div");
    blockUI.style = 'width: inherit; height: inherit; background-color: black; z-index: +999; position: fixed; opacity: 0.7;'
    blockUI.setAttribute("id", divId + "_" + "blocker");

    //Center space
    var positionTop = document.getElementById(divId).style.height.replace(/[^-\d\.]/g, '') - 50;
    var positionLeft = document.getElementById(divId).style.width.replace(/[^-\d\.]/g, '')/2 - 50;

    blockUI.innerHTML = '<div><i style="color:#ffffff; position:fixed; top:' + positionTop + 'px; left:' + positionLeft + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw"></i></div>'
    document.getElementById(divId).appendChild(blockUI);    
}

function unloadBlockUI(divId) {
    document.getElementById(divId + "_" + "blocker").style.display = "none";
}