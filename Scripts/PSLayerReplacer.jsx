var supportedFormats = ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "webp"];
var replacedCount = 0;

function openImageOfLayer(imageFolderPath, layer)
{
    for (var i = 0; i < supportedFormats.length; i += 1)
    {
        var supportedFormat = supportedFormats[i];
        var imagePath = imageFolderPath + "/" + layer.name + "." + supportedFormat;
        var imageFile = new File(imagePath);

        if (!imageFile)
            return null;

        if (imageFile.exists)
            return imageFile;
    }

    return null;
}

function replaceLayer(doc, imageFolderPath, layer)
{
    var imageFile = openImageOfLayer(imageFolderPath, layer);

    if (!imageFile) return;

    try
    {
        doc.activeLayer = layer;

        var oldBounds = layer.bounds;
        var oldLeft = oldBounds[0].as("px");
        var oldTop = oldBounds[1].as("px");
        var oldRight = oldBounds[2].as("px");
        var oldBottom = oldBounds[3].as("px");
        var oldWidth = oldRight - oldLeft;
        var oldHeight = oldBottom - oldTop;

        var newImageDoc = app.open(imageFile); // 打开新图像文件 Open the new image file
        newImageDoc.selection.selectAll();
        newImageDoc.selection.copy();
        newImageDoc.close(SaveOptions.DONOTSAVECHANGES); // 复制并关闭 Copy and close

        doc.paste();

        var newLayer = doc.activeLayer;

        var newBounds = newLayer.bounds;
        var newLeft = newBounds[0].as("px");
        var newTop = newBounds[1].as("px");
        var newRight = newBounds[2].as("px");
        var newBottom = newBounds[3].as("px");
        var newWidth = newRight - newLeft;
        var newHeight = newBottom - newTop;

        var deltaScaleX = oldWidth / newWidth * 100;
        var deltaScaleY = oldHeight / newHeight * 100;
        var deltaLeft = oldLeft - newLeft;
        var deltaTop = oldTop - newTop;

        newLayer.resize(deltaScaleX, deltaScaleY, AnchorPosition.TOPLEFT);
        newLayer.translate(deltaLeft, deltaTop);
        newLayer.name = layer.name;
        newLayer.blendMode = layer.blendMode;
        newLayer.opacity = layer.opacity;
        newLayer.fillOpacity = layer.fillOpacity;

        layer.remove(); // 移除原始图层 Remove the original layer

        replacedCount += 1;
    }
    catch (e)
    {
        alert("替换图层 " + layer.name + " 时出错: " + e.message); // 错误处理 Error handling
    }
}

function replaceLayers(doc, imageFolderPath, layers)
{
    for (var i = 0; i < layers.length; i += 1)
    {
        var layer = layers[i];

        if (layer.typename === "LayerSet")
            replaceLayers(doc, imageFolderPath, layer.layers);
        else
            replaceLayer(doc, imageFolderPath, layer);
    }
}

function main()
{
    var chosenPsdFile = File.openDialog("选择要修改的 PSD 文件", "*.psd");

    if (!chosenPsdFile)
    {
        alert("未选择任何 PSD 文件。");
        return;
    }

    var chosenImageFolder = Folder.selectDialog("选择要替换的图片文件夹");

    if (!chosenImageFolder)
    {
        alert("未选择任何图片文件夹。");
        return;
    }

    var doc = app.open(chosenPsdFile);
    var imageFolderPath = chosenImageFolder.fsName;

    replaceLayers(doc, imageFolderPath, doc.layers);

    alert("成功替换了 " + replacedCount + " 个图层的内容。");
}

main();
