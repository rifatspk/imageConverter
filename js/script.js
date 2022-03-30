imagePreviews = document.querySelector('#previews');
fileSelector = document.querySelector('input[type=file]');

function addImageBox(container) {
    let imageBox = document.querySelector('.preview');
    return imageBox;
}

function processFile(file) {
    if (!file) {
        return;
    }
    // console.log(file);

    let imageBox = addImageBox(imagePreviews);

    // Load the data into an image
    new Promise(function (resolve, reject) {
            let rawImage = new Image();

            rawImage.addEventListener("load", function () {
                resolve(rawImage);
            });

            rawImage.src = URL.createObjectURL(file);
        })
        .then(function (rawImage) {
            // Convert image to webp ObjectURL via a canvas blob
            return new Promise(function (resolve, reject) {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext("2d");

                canvas.width = rawImage.width;
                canvas.height = rawImage.height;
                ctx.drawImage(rawImage, 0, 0);

                canvas.toBlob(function (blob) {
                    resolve(URL.createObjectURL(blob));
                }, "image/webp");
            });
        })
        .then(function (imageURL) {
            return new Promise(function (resolve, reject) {
                let scaledImg = new Image();

                scaledImg.addEventListener("load", function () {
                    resolve({
                        imageURL,
                        scaledImg
                    });
                });
                scaledImg.setAttribute("src", imageURL);
            });

        })
        .then(function (data) {
            let oldName = file['name'];
            let newName = oldName.substr(0, oldName.lastIndexOf("."));
            newName = newName.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') + ".webp";
            let previewBox = '<div class=" col-md-4 mb-3"><div class="card text-center"><img class="card-img-top" src="' + data.imageURL + '"><div class="card-body"> <h5 class ="card-title">' + newName + ' </h5><a href="' + data.imageURL + '" class="btn btn-success" download="' + newName + '">Download</a> </div></div></div>';
            imageBox.insertAdjacentHTML("beforeend", previewBox);

        });
}

function processFiles(files) {
    for (let file of files) {
        processFile(file);
    }
}

function fileSelectorChanged() {
    processFiles(fileSelector.files);
    fileSelector.value = "";
}

fileSelector.addEventListener("change", fileSelectorChanged);

// Set up Drag and Drop
function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(callback, e) {
    e.stopPropagation();
    e.preventDefault();
    callback(e.dataTransfer.files);
}

function setDragDrop(area, callback) {
    area.addEventListener("dragenter", dragenter, false);
    area.addEventListener("dragover", dragover, false);
    area.addEventListener("drop", function (e) {
        drop(callback, e);
    }, false);
}
setDragDrop(document.documentElement, processFiles);