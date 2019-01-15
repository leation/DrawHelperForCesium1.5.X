var center = [110.98, 30.83];
var timer = null;
var viewer = null;
var scene = null;
var canvas = null;
var clock = null;
var camera = null;
var tracker = null;
var layerId = "globeDrawerDemoLayer";

$(function () {
    $(document).ready(function () {
        initialGlobeView();
        initDrawHelper();
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
            selectionIndicator: true,
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

        scene = viewer.scene;
        canvas = viewer.canvas;
        clock = viewer.clock;
        camera = viewer.scene.camera;
    }

    function initDrawHelper() {
        tracker = new GlobeTracker(viewer);

        $("#drawPolygon").click(function () {
            tracker.trackPolygon(function (positions) {
                var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
                var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
                });
                var outlinePositions = [].concat(positions);
                outlinePositions.push(positions[0]);
                var bData = {
                    layerId: layerId,
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
            });
        });
        $("#drawPolyline").click(function () {
            tracker.trackPolyline(function (positions) {
                var material = new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.25,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
                });
                var bData = {
                    layerId: layerId,
                    polyline: {
                        positions: positions,
                        clampToGround: true,
                        width: 8,
                        material: material
                    }
                };
                var entity = viewer.entities.add(bData);
            });
        });
        $("#drawRectangle").click(function () {
            tracker.trackRectangle(function (positions) {
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
            });
        });
        $("#drawCircle").click(function () {
            tracker.trackCircle(function (positions) {
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
                    polyline: {
                        positions: pnts,
                        clampToGround: true,
                        width: 2,
                        material: outlineMaterial
                    }
                };
                var outlineEntity = viewer.entities.add(outlineBdata);
            });
        });
        $("#drawPoint").click(function () {
            tracker.trackPoint(function (position) {
                var entity = viewer.entities.add({
                    layerId: layerId,
                    position: position,
                    billboard: {
                        image: "images/circle_red.png",
                        eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                });
            });
        });
        $("#drawBufferLine").click(function () {
            tracker.trackBufferLine(function (positions, radius) {
                var buffer = tracker.bufferLineDrawer.computeBufferLine(positions, radius);
                var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
                var lineMaterial = new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
                });
                var bData = {
                    layerId: layerId,
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
            });
        });

        $("#posMeasure").click(function () {
            tracker.pickPosition(function (position, lonLat) {
            });
        });
        $("#disMeasure").click(function () {
            tracker.pickDistance(function (positions, rlt) {
            });
        });
        $("#areaMeasure").click(function () {
            tracker.pickArea(function (positions, rlt) {
            });
        });

        $("#straightArrow").click(function () {
            tracker.trackStraightArrow(function (positions) {
                var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
                var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
                });
                var outlinePositions = [].concat(positions);
                outlinePositions.push(positions[0]);
                var bData = {
                    layerId: layerId,
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
            });
        });
        $("#attackArrow").click(function () {
            tracker.trackAttackArrow(function (positions, custom) {
                var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
                var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
                });
                var outlinePositions = [].concat(positions);
                outlinePositions.push(positions[0]);
                var bData = {
                    layerId: layerId,
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
            });
        });
        $("#pincerArrow").click(function () {
            tracker.trackPincerArrow(function (positions, custom) {
                var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
                var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                    dashLength: 16,
                    color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
                });
                var outlinePositions = [].concat(positions);
                outlinePositions.push(positions[0]);
                var bData = {
                    layerId: layerId,
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
            });
        });
    }
});