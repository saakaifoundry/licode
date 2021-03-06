/*global exports, require*/
'use strict';
var roomRegistry = require('./../mdb/roomRegistry');
var serviceRegistry = require('./../mdb/serviceRegistry');

var logger = require('./../logger').logger;

// Logger
var log = logger.getLogger('RoomsResource');

var currentService;

/*
 * Gets the service for the proccess of the request.
 */
var doInit = function () {
    currentService = require('./../auth/nuveAuthenticator').service;
};

/*
 * Post Room. Creates a new room for a determined service.
 */
exports.createRoom = function (req, res) {
    var room;

    doInit();

    if (currentService === undefined) {
        res.send('Service not found', 404);
        return;
    }
    if (req.body.name === undefined) {
        log.info('message: createRoom - invalid room name');
        res.send('Invalid room', 400);
        return;
    }

    req.body.options = req.body.options || {};

    if (req.body.options.test) {
        if (currentService.testRoom !== undefined) {
            log.info('message: testRoom already exists, serviceId: ' + currentService.name);
            res.send(currentService.testRoom);
        } else {
            room = {name: 'testRoom'};
            roomRegistry.addRoom(room, function (result) {
                currentService.testRoom = result;
                currentService.rooms.push(result);
                serviceRegistry.updateService(currentService);
                log.info('message: testRoom created, serviceId: ' + currentService.name);
                res.send(result);
            });
        }
    } else {
        room = {name: req.body.name};

        if (req.body.options.p2p) {
            room.p2p = true;
        }
        if (req.body.options.data) {
            room.data = req.body.options.data;
        }
        roomRegistry.addRoom(room, function (result) {
            currentService.rooms.push(result);
            serviceRegistry.updateService(currentService);
            log.info('message: createRoom success, roomName:' + req.body.name + ', serviceId: ' +
                     currentService.name + ', p2p: ' + room.p2p);
            res.send(result);
        });
    }
};

/*
 * Get Rooms. Represent a list of rooms for a determined service.
 */
exports.represent = function (req, res) {
    doInit();
    if (currentService === undefined) {
        res.send('Service not found', 404);
        return;
    }
    log.info('message: representRooms, serviceId: ' + currentService._id);

    res.send(currentService.rooms);
};
