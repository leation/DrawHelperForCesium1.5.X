var center = [110.98, 30.83];
var viewer = null;
var tracker = null;
//图层名称
var layerId = "globeDrawerDemoLayer";
//全局变量，用来记录shape坐标信息
var shapeDic = {};
//编辑或删除标识,1为编辑，2为删除
var flag = 0;

$(function () {
    $(document).ready(function () {
        initialGlobeView();
        initDrawHelper();
        bindGloveEvent();
    });

    function initialGlobeView() {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjRjNGFjNy1jNDM3LTQzMTktODVlYS05YmFmOTAxYjk5MWUiLCJpZCI6Mzk5MSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTUzOTU3OTE2NX0.-25udUzENRJ66mnICMK8Hfc6xgF_VP7P4sWkSHaUjOQ';

        var image_Source = new Cesium.UrlTemplateImageryProvider({
            url: 'http://mt0.google.cn/vt/lyrs=t,r&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
            credit: ''
        });
        viewer = new Cesium.Viewer('cesiumContainer', {
            geocoder: false,
            homeButton: true,
            sceneModePicker: true,
            fullscreenButton: true,
            vrButton: true,
            baseLayerPicker: false,
            infoBox: false,
            selectionIndicator: false,
            animation: false,
            timeline: false,
            shouldAnimate: true,
            navigationHelpButton: true,
            navigationInstructionsInitiallyVisible: false,
            mapProjection: new Cesium.WebMercatorProjection(),
            imageryProvider: image_Source,
            terrainProvider: Cesium.createWorldTerrain()
        });
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.showGroundAtmosphere = false;
    }

    function initDrawHelper() {
        tracker = new GlobeTracker(viewer);

        $("#drawPolygon").click(function () {
            flag = 0;
            tracker.trackPolygon(function (positions) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = positions;
                showPolygon(objId, positions);

            });
        });
        $("#drawPolyline").click(function () {
            flag = 0;
            tracker.trackPolyline(function (positions) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = positions;
                showPolyline(objId, positions);
            });
        });
        $("#drawRectangle").click(function () {
            flag = 0;
            tracker.trackRectangle(function (positions) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = positions;
                showRectangle(objId, positions);
            });
        });
        $("#drawCircle").click(function () {
            flag = 0;
            tracker.trackCircle(function (positions) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = positions;
                showCircle(objId, positions);
            });
        });
        $("#drawPoint").click(function () {
            flag = 0;
            tracker.trackPoint(function (position) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = position;
                showPoint(objId, position);
            });
        });
        $("#drawBufferLine").click(function () {
            flag = 0;
            tracker.trackBufferLine(function (positions, radius) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = {
                    positions: positions,
                    radius: radius
                };
                showBufferLine(objId, positions, radius);
            });
        });

        $("#posMeasure").click(function () {
            flag = 0;
            tracker.pickPosition(function (position, lonLat) {
            });
        });
        $("#disMeasure").click(function () {
            flag = 0;
            tracker.pickDistance(function (positions, rlt) {
            });
        });
        $("#areaMeasure").click(function () {
            flag = 0;
            tracker.pickArea(function (positions, rlt) {
            });
        });

        $("#straightArrow").click(function () {
            flag = 0;
            tracker.trackStraightArrow(function (positions) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = positions;
                showStraightArrow(objId, positions);
            });
        });
        $("#attackArrow").click(function () {
            flag = 0;
            tracker.trackAttackArrow(function (positions, custom) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = {
                    custom: custom,
                    positions: positions
                };
                showAttackArrow(objId, positions);
            });
        });
        $("#pincerArrow").click(function () {
            flag = 0;
            tracker.trackPincerArrow(function (positions, custom) {
                var objId = (new Date()).getTime();
                shapeDic[objId] = {
                    custom: custom,
                    positions: positions
                };
                showPincerArrow(objId, positions);
            });
        });

        $("#editShape").click(function () {
            layer.msg("点击要编辑的箭头！");
            flag = 1;
            //清除标绘状态
            tracker.clear();
        });
        $("#deleteShape").click(function () {
            layer.msg("点击要删除的箭头！");
            flag = 2;
            //清除标绘状态
            tracker.clear();
        });
    }

    //绑定cesiu事件
    function bindGloveEvent() {
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (movement) {
            var pick = viewer.scene.pick(movement.position);
            if (!pick) {
                return;
            }
            var obj = pick.id;
            if (!obj || !obj.layerId || flag == 0) {
                return;
            }
            var objId = obj.objId;
            //flag为编辑或删除标识,1为编辑，2为删除
            if (flag == 1) {
                switch (obj.shapeType) {
                    case "Polygon":
                        flag = 0;
                        editPolygon(objId);
                        break;
                    case "Polyline":
                        flag = 0;
                        editPolyline(objId);
                        break;
                    case "Rectangle":
                        flag = 0;
                        editRectangle(objId);
                        break;
                    case "Circle":
                        flag = 0;
                        editCircle(objId);
                        break;
                    case "Point":
                        flag = 0;
                        editPoint(objId);
                        break;
                    case "BufferLine":
                        flag = 0;
                        editBufferLine(objId);
                        break;
                    case "StraightArrow":
                        flag = 0;
                        editStraightArrow(objId);
                        break;
                    case "AttackArrow":
                        flag = 0;
                        editAttackArrow(objId);
                        break;
                    case "PincerArrow":
                        flag = 0;
                        editPincerArrow(objId);
                        break;
                    default:
                        break;
                }
            } else if (flag == 2) {
                clearEntityById(objId);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    function showPolygon(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "Polygon",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                asynchronous: false,
                material: material
            })
        };
        var entity = viewer.entities.add(bData);
    }
    function showPolyline(objId, positions) {
        var material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
        });
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "Polyline",
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 8,
                material: material
            }
        };
        var entity = viewer.entities.add(bData);
    }
    function showRectangle(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
        });
        var rect = Cesium.Rectangle.fromCartesianArray(positions);
        var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
        var outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr);
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "Rectangle",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            rectangle: {
                coordinates: rect,
                material: material
            }
        };
        var entity = viewer.entities.add(bData);
    }
    function showCircle(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        var radiusMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
        });
        var pnts = tracker.circleDrawer._computeCirclePolygon(positions);
        var dis = tracker.circleDrawer._computeCircleRadius3D(positions);
        dis = (dis / 1000).toFixed(3);
        var text = dis + "km";
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "Circle",
            position: positions[0],
            label: {
                text: text,
                font: '16px Helvetica',
                fillColor: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -9000)),
                pixelOffset: new Cesium.Cartesian2(16, 16)
            },
            billboard: {
                image: "images/circle_center.png",
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 2,
                material: radiusMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: pnts,
                asynchronous: false,
                material: material
            })
        };
        var entity = viewer.entities.add(bData);

        var outlineBdata = {
            layerId: layerId,
            objId: objId,
            shapeType: "Circle",
            polyline: {
                positions: pnts,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            }
        };
        var outlineEntity = viewer.entities.add(outlineBdata);
    }
    function showPoint(objId, position) {
        var entity = viewer.entities.add({
            layerId: layerId,
            objId: objId,
            shapeType: "Point",
            position: position,
            billboard: {
                image: "images/circle_red.png",
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
    }
    function showBufferLine(objId, positions, radius) {
        var buffer = tracker.bufferLineDrawer.computeBufferLine(positions, radius);
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var lineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
        });
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "BufferLine",
            polygon: new Cesium.PolygonGraphics({
                hierarchy: buffer,
                asynchronous: false,
                material: material
            }),
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 2,
                material: lineMaterial
            }
        };
        var entity = viewer.entities.add(bData);
    }
    function showStraightArrow(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "StraightArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                asynchronous: false,
                material: material
            })
        };
        var entity = viewer.entities.add(bData);
    }
    function showAttackArrow(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "AttackArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                asynchronous: false,
                material: material
            })
        };
        var entity = viewer.entities.add(bData);
    }
    function showPincerArrow(objId, positions) {
        var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: layerId,
            objId: objId,
            shapeType: "PincerArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                asynchronous: false,
                material: material
            })
        };
        var entity = viewer.entities.add(bData);
    }

    function editPolygon(objId) {
        var oldPositions = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.polygonDrawer.showModifyPolygon(oldPositions, function (positions) {
            shapeDic[objId] = positions;
            showPolygon(objId, positions);
        }, function () {
            showPolygon(objId, oldPositions);
        });
    }
    function editPolyline(objId) {
        var oldPositions = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.polylineDrawer.showModifyPolyline(oldPositions, function (positions) {
            shapeDic[objId] = positions;
            showPolyline(objId, positions);
        }, function () {
            showPolyline(objId, oldPositions);
        });
    }
    function editRectangle(objId) {
        var oldPositions = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.rectDrawer.showModifyRectangle(oldPositions, function (positions) {
            shapeDic[objId] = positions;
            showRectangle(objId, positions);
        }, function () {
            showRectangle(objId, oldPositions);
        });
    }
    function editCircle(objId) {
        var oldPositions = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.circleDrawer.showModifyCircle(oldPositions, function (positions) {
            shapeDic[objId] = positions;
            showCircle(objId, positions);
        }, function () {
            showCircle(objId, oldPositions);
        });
    }
    function editPoint(objId) {
        var oldPosition = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.pointDrawer.showModifyPoint(oldPosition, function (position) {
            shapeDic[objId] = position;
            showPoint(objId, position);
        }, function () {
            showPoint(objId, oldPosition);
        });
    }
    function editBufferLine(objId) {
        var old = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.bufferLineDrawer.showModifyBufferLine(old.positions, old.radius, function (positions, radius) {
            shapeDic[objId] = {
                positions: positions,
                radius: radius
            };
            showBufferLine(objId, positions, radius);
        }, function () {
            showBufferLine(old.positions, old.radius, oldPositions);
        });
    }
    function editStraightArrow(objId) {
        var oldPositions = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        //进入编辑状态  
        tracker.straightArrowDrawer.showModifyStraightArrow(oldPositions, function (positions) {
            shapeDic[objId] = positions;
            showStraightArrow(objId, positions);
        }, function () {
            showStraightArrow(objId, oldPositions);
        });
    }
    function editAttackArrow(objId) {
        var old = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        tracker.attackArrowDrawer.showModifyAttackArrow(old.custom, function (positions, custom) {
            //保存编辑结果
            shapeDic[objId] = {
                custom: custom,
                positions: positions
            };
            showAttackArrow(objId, positions);
        }, function () {
            showAttackArrow(objId, old.positions);
        });
    }
    function editPincerArrow(objId) {
        var old = shapeDic[objId];

        //先移除entity
        clearEntityById(objId);

        tracker.pincerArrowDrawer.showModifyPincerArrow(old.custom, function (positions, custom) {
            //保存编辑结果
            shapeDic[objId] = {
                custom: custom,
                positions: positions
            };
            showPincerArrow(objId, positions);
        }, function () {
            showPincerArrow(objId, old.positions);
        });
    }

    function clearEntityById(objId) {
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerId && entity.objId == objId) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    }
});