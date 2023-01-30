export default {
    header: {
        logoSubtitle: 'i masz spanie!',
            callToAction: 'Wynajmij i zarabiaj bez opłat',
            download: {
            firstLine: {
                beforeLogo: 'Pobierz naszą aplikację',
                    afterLogo: 'na'
            },
            secondLine: 'system Android i IOS'
        },
        login: 'Zaloguj się'
    },
    footer: {
        callToAction: 'Zostań wynajmującym bez opłat',
            informationSection: 'Informacje',
            prices: 'Ceny',
            cityList: 'Lista miast',
            partnerProgram: 'Program partnerski',
            faq: 'Pytania i odpowiedzi Q&A',
            help: 'Centrum pomocy',
            contact: 'Kontakt',
            about: 'O bed!OK',
            careers: 'Kariera',
            information: 'Informacje',
            termsOfCooperation: 'Zasady współpracy',
            privacyPolicy: 'Oświadczenie o ochronie prywatności i plikach cookies',
            cookies: 'Zarządzaj ustawieniami dotyczącymi plików cookies',
            clientSection: 'klient',
            login: 'Logowanie',
            registration: 'Rejestracja',
            specialOffers: 'Oferty specjalne',
            copyrightsNote: {
            firstPart: 'Prawa autorskie',
                year: '2022',
                lastPart: 'bed!Ok. Wszelkie prawa autorskie zastrzeżone.'
        }
    },
    auth: {
        login: {
            login: 'Zaloguj się',
            facebook: 'Zaloguj się przez facebook',
            google: 'Zaloguj się przez Google',
            email: {
                placeholder: 'Email'
            },
            password: {
                placeholder: 'Hasło'
            },
            phoneNumber: {
                placeholder: 'Nr tel.'
            },
            forgotPassword: 'Zapomniałem hasła',
            action: {
                login: 'ZALOGUJ SIĘ',
                hint: 'Jeśli nie posiadasz u nas konta, możesz się w prosty sposób zarejestrować',
                register: 'ZAŁÓŻ KONTO'
            }
        }
    },
    homeView: {
        title: {
            firstLine: 'Potrzebne zakwaterowanie?',
                secondLine: 'Wejdź na BedOK i masz spanie!',
        },
        looking: 'szukam',
            offering: 'oferuję',
            joinRoom: 'NOWOŚĆ! Dołącz do pokoju',
            citiesTitle: 'W którym mieście chcesz znaleźć nocleg?',
            howItWorks: 'Jak to działa?',
            subscribe: 'Zapisz się aby otrzymywać najświeższe informacje i promocje',
            freeAppLink: 'Chcę otrzymać link do bezpłatnej aplikacji'
    },
    advertisementView: {
        header: 'Dodaj ogłoszenie',
            mainSection: {
            title: {
                label: 'Tytuł ogłoszenia*',
                    tip: 'od 7 do 70 znaków',
                    placeholder: 'Np. Pokój dwuosobowy w cichej okolicy',
                    validationMessages: {
                    length: 'Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
                        required: 'To pole jest wymagane.'
                }
            },
            address: {
                label: 'Adres*',
                    cityPlaceholder: 'Miasto',
                    zipCodePlaceholder: 'Kod pocztowy',
                    streetPlaceholder: 'Ulica',
                    streetNumberPlaceholder: 'Nr domu',
                    flatNumberPlaceholder: 'Nr lokalu',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            photos: {
                label: 'Zdjęcia*',
                    tip: 'min. 1 szt. , max 8 szt.'
            }
        },
        hostSection: {
            hostName: {
                label: 'Nazwa gospodarza*',
                    placeholder: 'Imię',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            phoneNumber: {
                label: 'Nr telefonu*',
                    placeholder: 'Np. +48 000 000 000',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            email: {
                label: 'E-mail*',
                    placeholder: "Np. jan_kowalski{'@'}o2.pl",
                    validationMessages: {
                    required: 'To pole jest wymagane.',
                        email: 'Nieprawdiłowy email'
                }
            },
            photo: {
                label: 'Zdjęcie gospodarza'
            },
            languages: {
                label: 'Języki, którymi posługuje się gospodarz*',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            communicators: {
                label: 'Komunikatory, których używa gospodarz*',
                    tip: 'Aplikacje do komnikacji przez internet',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            }
        },
        descriptionSection: {
            description: {
                label: 'Opis*',
                    tip: 'maksimum 5000 znaków',
                    tabs: {
                    own: 'Własny',
                        preset1: 'Szablon 1',
                        preset2: 'Szablon 2'
                },
                charactersCounter: 'Pozostało {count} znaków'
            },
            roomSize: {
                label: 'Powierzchnia pokoju (m2)*',
                    placeholder: 'np. 4.86',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            splitIntoBeds: {
                label: 'Pokój dzielony na łóżka',
                    value: 'Podziel'
            },
            bedsCount: {
                label: 'Liczba łóżek w pokoju*',
                    placeholder: 'np. 6',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            roomType: {
                label: 'Typ pokoju'
            },
            freeBedsCount: {
                label: 'Liczba wolnych łóżek w pokoj*',
                    validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            }
        },
        currentGuestsSection: {
            title: 'Podaj informację o aktualnych lokatorach, tj. imię, wiek, języki, którymi się posługują',
                name: {
                placeholder: 'Imię'
            },
            birthYear: {
                label: 'Rok urodzenia*'
            }
        },
        paymentSection: {
            paymentMethod: {
                label: 'Formy płatności:'
            },
            pricing: {
                label: 'Ceny (zł):'
            },
            day: 'doba',
                month: 'miesiąc',
                shortRentRange: 'Ilość dni (od 1 do 30 dni)',
                longRentRange: 'Ilość miesięcy (powyżej 1 miesiąca)',
                addPriceRange: 'Dodaj kolejny zakres cen'
        },
        rulesSection: {
            termsOfStay: 'Zasady pobytu:',
                animals: 'Akceptujemy zwierzęta:',
                curfew: 'Cisza nocna (22:00 - 6:00):',
                smoking: 'Palenie w budynku dozwolone:',
                others: {
                label: 'Inne:',
                    placeholder: 'np. brak parkingu, grill w ogrodzie'
            }
        },
        equipmentSection: {
            roomEquipment: {
                label: 'Wyposażenie pokoju',
                    placeholder: 'np. lampka, dywan'
            },
            sharedEquipment: {
                label: 'Wyposażenie strefy wspólnej',
                    placeholder: 'np. lampka, dywan'
            }
        },
        actions: {
            preview: {
                label: 'Zobacz podgląd ogłoszenia',
                    tip: '(zobaczysz jak podgląd ogłoszenie przed jego publikacją)'
            },
            save: {
                label: 'Zapisz ogłoszenie',
                    tip: '(nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
            },
            publish: {
                label: 'Opublikuj ogłoszenie',
                    tip: '(nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
            },
            duplicate: {
                label: 'Zduplikuj ogłoszenie z wypełnionymi danymi',
                    tip: '(zaoszczędzisz czas dodając pokoje w tym samymy budynku)'
            }
        }
    },
    advertisementDetailsView: {
        subheader: {
            markAsFavorite: 'Dodaj do ulubionych',
            share: 'Udostępnij'
        },
        descriptionWithMap: {
            description: 'Opis:',
            location: 'Lokalizacja'
        },
        host: {
            meetTheHost: 'POZNAJ GOSPODARZA',
            communicators: 'Używam:'
        },
        roomArea: 'Powierzchnia pokoju: {area} m2',
        currentTenants: 'Aktualnie u nas mieszka:',
        currentTenantsCount: 'Liczba osób aktualnie zamieszkujących pokój:',
        seeOtherEquipment: 'Zobacz pozostałe udogodnienia',
        sharedArea: 'Część wspólna: lobby, kuchnia, łazienka',
        roomSplitToBeds: 'Pokój dzielony na łóżka',
        sharedRoom: 'Współdzielony z innymi mieszkańcami',
        roomEquipment: 'Wyposażenie pokoju:',
        sharedEquipment: 'Wyposażenie części wspólnej:',
        paymentMethods: 'Metody płatności:',
        rulesOfStay: 'Zasady pobytu:',
        pricePerBed: 'Cena za łóżko {price} {currency} ({duration})',
        book: 'Zarezerwuj łóżko',
        beds: '{count} łóżka',
        rooms: '{count} pokoje'
    },
    hostAdvertisementsView: {
        myAdvertisements: 'Moje ogłoszenia',
        expertPanel: 'Panel EXPERT',
        active: 'Aktywne',
        inactive: 'Nieaktywne',
        addNewAd: 'Dodaj nowe ogłoszenie',
        freeBeds: 'Wolne: {count} łóżka',
        messages: 'Wiadomości:',
        newMessagesCount: '{count} nieprzeczytanych',
        editAd: 'Edytuj ogłoszenie',
        createFromCurrent: 'Stwórz nowe ogłoszenie na podstawie obecnego',
        createFromCurrentHint: '(zaoszczędzisz czas dodając pokoje w tym samym budynku)',
        deactivateAd: 'Zakończ ogłoszenie',
        deactivateAdHint: '(ogłoszenie przejdzie do sekcji Nieaktywne)',
        publishAd: 'Opublikuj ogłoszenie',
        publishAdHint: '(nadal będziesz miał/a możliwość wprowadzania zmian w dowolnym momencie)',
        removeAd: 'Usuń ogłoszenie',
        removeAdHint: '(ogłoszenie zostanie usunięte)'
    },
    expertPanelView: {
        removeTenant: 'Usuń lokatora',
        addTenant: 'Dodaj lokatora',
        removeAllTenants: 'Usuń wszystkich lokatorów',
        editAd: 'Edytuj ogłoszenie',
        createAdFromCurrent: 'Stwórz nowe ogłoszenie na podstawie obecnego',
        expertPanel: 'Panel EXPERT',
        myAdvertisements: 'Moje ogłoszenia:',
        address: 'Adres:',
        room: 'Pokój:',
        occupiedBeds: 'Zajęte łóżka:',
        freeBeds: 'Wolne łóżka:',
        currentTenants: 'Aktualni lokatorzy:',
        createAd: 'Dodaj nowe ogłoszenie'
    },
    searchInput: {
        localization: {
            label: 'Lokalizacja',
                placeholder: 'Gdzie szukasz noclegu'
        },
        since: 'Od kiedy',
            to: 'Do kiedy',
            who: {
            label: 'Kto',
                placeholder: 'Ile osób'
        },
        search: 'Szukaj'
    },
    roomCard: {
        district: 'Dzielnica:',
        bedsInRoom: '{count} łóżka w pokoju',
        dayPrice: '{price} zł / dzień',
        bedDayPrice: '{price} zł / dzień / łóżko',
        femaleRoom: 'Pokój żenski',
        maleRoom: 'Pokój męski',
        otherGenderRoom: 'Pokój mieszany',
        tenants: 'Lokatorzy:',
        join: 'Dołącz do pokoju'
    },
};
