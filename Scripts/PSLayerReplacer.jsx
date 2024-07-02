//PSDLayer Replacer by Rinorsi

// 支持的图像格式 Supported image formats
var supportedFormats = ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "webp"];

// 选择PSD文件 Select PSD file
var psdFile = File.openDialog("选择要修改的 PSD 文件 (Select the PSD file to modify)", "*.psd");
if(psdFile) {
    // 选择图像文件夹 Select image folder
    var imagesFolder = Folder.selectDialog("选择要替换的图片文件夹 (Select the folder containing replacement images)");
    if(imagesFolder) {
        var doc = app.open(psdFile);
        var replacedCount = 0;

        // 替换图层内容的函数 Function to replace layer contents
        function replaceLayers(layers) {
            for(var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if(layer.typename === "LayerSet") { // 如果是图层组 If it's a LayerSet
                    replaceLayers(layer.layers); // 递归调用 Replace layers recursively
                } else {
                    var layerName = layer.name;
                    var imageFile = null;

                    // 查找匹配的图像文件 Find matching image file
                    for (var j = 0; j < supportedFormats.length; j++) {
                        var format = supportedFormats[j];
                        imageFile = new File(imagesFolder.fsName + "/" + layerName + "." + format);
                        if (imageFile.exists) {
                            break;
                        }
                    }

                    if(imageFile && imageFile.exists) { // 如果找到匹配的图像文件 If a matching image file is found
                        try {
                            doc.activeLayer = layer;
                            var bounds = layer.bounds;
                            var left = bounds[0].as("px");
                            var top = bounds[1].as("px");
                            var right = bounds[2].as("px");
                            var bottom = bounds[3].as("px");
                            var width = right - left;
                            var height = bottom - top;
                            var newImageDoc = app.open(imageFile); // 打开新图像文件 Open the new image file
                            newImageDoc.selection.selectAll();
                            newImageDoc.selection.copy();
                            newImageDoc.close(SaveOptions.DONOTSAVECHANGES); // 复制并关闭 Copy and close
                            doc.paste();
                            var pastedLayer = doc.activeLayer;
                            var newBounds = pastedLayer.bounds;
                            var newWidth = newBounds[2] - newBounds[0];
                            var newHeight = newBounds[3] - newBounds[1];
                            var widthRatio = width / newWidth.as("px");
                            var heightRatio = height / newHeight.as("px");
                            pastedLayer.resize(widthRatio * 100, heightRatio * 100, AnchorPosition.TOPLEFT); // 调整大小 Resize
                            pastedLayer.translate(left - pastedLayer.bounds[0].as("px"), top - pastedLayer.bounds[1].as("px")); // 位置调整 Reposition
                            pastedLayer.name = layerName;
                            pastedLayer.blendMode = layer.blendMode;
                            pastedLayer.opacity = layer.opacity;
                            pastedLayer.fillOpacity = layer.fillOpacity;
                            layer.remove(); // 移除原始图层 Remove the original layer
                            replacedCount++;
                        } catch (e) {
                            alert("替换图层 " + layerName + " 时出错: " + e.message); // 错误处理 Error handling
                        }
                    }
                }
            }
        }

        replaceLayers(doc.layers);
        alert("成功替换了 " + replacedCount + " 个图层的内容喵~(Successfully replaced " + replacedCount + " layers.)");
    } else {
        alert("未选择任何图片文件夹。 (No image folder selected.)");
    }
} else {
    alert("未选择任何 PSD 文件。 (No PSD file selected.)");
}
