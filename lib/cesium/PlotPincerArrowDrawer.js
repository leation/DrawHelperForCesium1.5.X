var PlotPincerArrowDrawer = function () {
    this.init.apply(this, arguments);
};

PlotPincerArrowDrawer.prototype = {
    viewer: null,
    scene: null,
    clock: null,
    canvas: null,
    camera: null,
    ellipsoid: null,
    tooltip: null,
    entity: null,
    positions: [],
    tempPositions: [],
    drawHandler: null,
    modifyHandler: null,
    okHandler: null,
    cancelHandler: null,
    dragIcon: "images/circle_gray.png",
    dragIconLight: "images/circle_red.png",
    material: null,
    outlineMaterial: null,
    fill: true,
    outline: true,
    outlineWidth: 2,
    extrudedHeight: 0,
    toolBarIndex: null,
    markers: {},
    layerId: "globeDrawerLayer",
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
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
    },
    showModifyPincerArrow: function (custom, okHandler, cancelHandler) {
        var _this = this;
        var arr = [];
        for (var i = 0; i < custom.length; i++) {
            var p = custom[i];
            var c = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
            arr.push(c);
        }
        _this.positions = arr;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this._showModifyRegion2Map();
    },
    startDrawPincerArrow: function (okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        var floatingPoint = null;
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var num = _this.positions.length;
            if (num == 0) {
                _this.positions.push(cartesian);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }
            _this.positions.push(cartesian);
            var oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);

            if (_this.positions.length > 5) {
                _this.positions.pop();
                _this.viewer.entities.remove(floatingPoint);
                _this.tooltip.setVisible(false);
                _this._startModify();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            _this.tooltip.showAt(position, "<p>新增控制点</p>");

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            floatingPoint.position.setValue(cartesian);
            _this.positions.pop();
            _this.positions.push(cartesian);
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
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
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
                _this.positions[oid] = cartesian;
                _this.tooltip.setVisible(false);
            } else {
                var pickedObject = _this.scene.pick(position);
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
                _this.tooltip.showAt(position, "<p>移动控制点</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            _this.tooltip.showAt(position, "<p>移动控制点</p>");

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.positions[oid] = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    _showRegion2Map: function () {
        var _this = this;
        if (_this.material == null) {
            _this.material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        }
        if (_this.outlineMaterial == null) {
            _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
            });
        }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 3) {
                return null;
            }
            try {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.doubleArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                if (!Cesium.defined(positions)) {
                    return null;
                }
                if (positions == null || positions.length < 3) {
                    return null;
                }
                return positions;
            } catch (err) {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 3) {
                return null;
            }
            try {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.doubleArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                if (!Cesium.defined(positions)) {
                    return null;
                }
                if (positions == null || positions.length < 3) {
                    return null;
                }
                var firstPoint = positions[0];
                positions.push(firstPoint);
                return positions;
            } catch (err) {
                return null;
            }
        }, false);
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicPositions,
                material: _this.material,
                show: _this.fill
            }),
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    },
    _showModifyRegion2Map: function () {
        var _this = this;

        _this._startModify();
        _this._computeTempPositions();

        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 3) {
                return null;
            }
            try {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.doubleArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                return positions;
            } catch (err) {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 3) {
                return null;
            }
            try {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.doubleArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                if (positions == null || positions.length < 2) {
                    return null;
                }
                var firstPoint = positions[0];
                positions.push(firstPoint);
                return positions;
            } catch (err) {
                return null;
            }
        }, false);

        if (_this.material == null) {
            _this.material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        }
        if (_this.outlineMaterial == null) {
            _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
            });
        }
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicPositions,
                material: _this.material,
                show: _this.fill
            }),
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.positions;
        for (var i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    },
    _createPoint: function (cartesian, oid) {
        var _this = this;
        var point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.markers[oid] = point;
        return point;
    },
    _computeTempPositions: function () {
        var _this = this;

        var pnts = [].concat(_this.positions);
        var num = pnts.length;
        var first = pnts[0];
        var last = pnts[num - 1];
        if (_this._isSimpleXYZ(first, last) == false) {
            pnts.push(first);
            num += 1;
        }
        _this.tempPositions = [];
        for (var i = 1; i < num; i++) {
            var p1 = pnts[i - 1];
            var p2 = pnts[i];
            var cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
    },
    _computeCenterPotition: function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
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
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.doubleArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                var custom = doubleArrow.controlPoint;
                _this.okHandler(positions, custom);
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
            }
        });
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
    _getLonLatArr: function (positions) {
        var _this = this;
        var arr = [];
        for (var i = 0; i < positions.length; i++) {
            var p = _this._getLonLat(positions[i]);
            if (p != null) {
                arr.push([p.lon, p.lat]);
            }
        }
        return arr;
    },
    _isSimpleXYZ: function (p1, p2) {
        if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            return true;
        }
        return false;
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
    _clearAnchors: function () {
        var _this = this;
        for (var key in _this.markers) {
            var m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    },
    CLASS_NAME: "PlotPincerArrowDrawer"
};