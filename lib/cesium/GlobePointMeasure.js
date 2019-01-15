var GlobePointMeasure = function () {
    this.init.apply(this, arguments);
};

GlobePointMeasure.prototype = {
    viewer: null,
    scene: null,
    clock: null,
    canvas: null,
    camera: null,
    ellipsoid: null,
    tooltip: null,
    entity: null,
    position: null,
    drawHandler: null,
    modifyHandler: null,
    callback: null,
    image: "images/circle_red.png",
    toolBarIndex: null,
    layerId: "globeEntityDrawerLayer",
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.tooltip = new GlobeTooltip(viewer.container);
    },
    clear: function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
        }
        _this.entity = null;
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
    },
    showModifyPoint: function (position, callback) {
        var _this = this;
        _this.position = position;
        _this.callback = callback;
        _this.entity = null;
        _this._createPoint();
        _this._startModify();
    },
    startDrawPoint: function (callback) {
        var _this = this;
        _this.callback = callback;
        _this.entity = null;

        _this.position = null;
        var floatingPoint = null;
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;

            _this.entity.position.setValue(cartesian);
            var text = _this._getMeasureTip(_this.position);
            _this.entity.label.text = text;

            _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            var wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            if (_this.position == null) {
                _this.tooltip.showAt(wp, "<p>选择位置</p>");
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            if (_this.entity == null) {
                _this._createPoint();
            } else {
                _this.entity.position.setValue(cartesian);
                var text = _this._getMeasureTip(_this.position);
                _this.entity.label.text = text;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    _startModify: function () {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        _this._showToolBar();

        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.modifyHandler.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                pickedAnchor.position.setValue(cartesian);
                var oid = pickedAnchor.oid;
                _this.position = cartesian;
                _this.tooltip.setVisible(false);
            } else {
                var pickedObject = _this.scene.pick(wp);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                var entity = pickedObject.id;
                if (entity.layerId != _this.layerId || entity.flag != "anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                _this.tooltip.showAt(wp, "<p>移动位置</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            _this.tooltip.showAt(wp, "<p>移动位置</p>");

            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            pickedAnchor.position.setValue(cartesian);
            var text = _this._getMeasureTip(_this.position);
            _this.entity.label.text = text;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    _createPoint: function () {
        var _this = this;
        var text = _this._getMeasureTip(_this.position);
        var point = viewer.entities.add({
            position: _this.position,
            label: {
                text: text,
                font: '18px "微软雅黑", Arial, Helvetica, sans-serif, Helvetica',
                fillColor: Cesium.Color.RED,
                outlineColor: Cesium.Color.SKYBLUE,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -9000)),
                pixelOffset: new Cesium.Cartesian2(36, 36)
            },
            billboard: {
                image: _this.image,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = 0;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.entity = point;
        return point;
    },
    _getMeasureTip: function (cartesian) {
        var _this = this;
        var pos = _this._getLonLat(cartesian);
        if (!pos.alt) {
            pos.alt = "";
        } else {
            pos.alt = pos.alt.toFixed(1);
        }
        pos.lon = pos.lon.toFixed(3);
        pos.lat = pos.lat.toFixed(3);
        var tip = "经度：" + pos.lon + "，纬度：" + pos.lat + "\n 海拔=" + pos.alt + "米";
        return tip;
    },
    _getLonLat: function (cartesian) {
        var _this = this;
        var cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = _this.viewer.scene.globe.getHeight(cartographic);
        var pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    },
    _showToolBar: function () {
        var _this = this;
        _this._createToolBar();
        var width = $(window).width();
        var wTop = 60;
        var wLeft = parseInt((width - 145) / 2);
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditContainer"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner"
        });
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    },
    _createToolBar: function () {
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
                 + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> <i class="layui-icon"></i> 确定 </button>'
                 + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> <i class="layui-icon">ဆ</i> 取消 </button>'
                 + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
                 + '    </div>'
                 + '</div>';
        $("body").append(html);

        var btnOK = $("#shapeEditContainer button[name='btnOK']");
        var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            if (_this.callback) {
                var lonLat = _this._getLonLat(_this.position);
                _this.clear();
                layer.close(_this.toolBarIndex);
                _this.callback(_this.position, lonLat);
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
        });
    },
    _clearMarkers: function (layerName) {
        var _this = this;
        var viewer = _this.viewer;
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    },
    CLASS_NAME: "GlobePointMeasure"
};