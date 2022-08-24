const fs = require("fs");
const request = require("request");

const hostCreationData = [
    { hostName: 'Dawid', hostEmail: 'dawid@dawid.pl', hostPhone: '123123123', hostPassword: 'test123' },
    { hostName: 'John', hostEmail: 'john@john.pl', hostPhone: '4564556456', hostPassword: 'test123' },
    { hostName: 'Sara', hostEmail: 'sara@sara.pl', hostPhone: '789789789', hostPassword: 'test123' },
]

const getHostCreationRequestOptions = ({ hostName, hostEmail, hostPhone, hostPassword }) => ({
    method: 'POST',
    url: 'http://localhost:8080/host',
    headers:
        {
            'postman-token': '010e2dee-9091-bae8-f2e9-d0d6581674bf',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
    formData:
        {
            hostName,
            hostEmail,
            hostPhone,
            hostPassword,
            hostPhoto:
                {
                    value: 'fs.createReadStream("avatar.jpg")',
                    options: { filename: 'avatar.jpg', contentType: null }
                },
        }
});

hostCreationData.forEach(hostData => {
    request(getHostCreationRequestOptions(hostData), function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
});

const advertisementCreationData = [];

const advertisementOptionsRequest = {
    method: 'POST',
    url: 'http://localhost:8080/advertisements',
    headers:
        {
            'postman-token': '03ae14a5-5069-df10-09df-3ee38cb2763e',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
    formData:
        {
            hostId: '1',
            postCode: '55200',
            hostStreet: 'Kwiatowa',
            roomPhotos:
                {
                    value: 'fs.createReadStream("room.jpg")',
                    options: { filename: 'room.jpg', contentType: null }
                },
            roomDescription: 'Super pokój fajny wesoły',
            roomArea: 'Rynek',
            numBeds: '5',
            sharedBeds: 'true',
            language: 'polish',
            paymentType: 'blik',
            RentalRules: 'cisza',
            'roomEquipment.0': 'czajnik',
            'roomEquipment.1': 'telewizor',
            'sharedEquipment.0': 'telewizor',
            'priceList.0.rangeFrom': '2',
            'priceList.0.rangeTo': '5',
            'pricesList.0.value': '20'
        }
};

request(advertisementOptionsRequest, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
});
