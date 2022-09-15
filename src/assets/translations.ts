const translations = {
    pl: {
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
            dayPrice: '{price} / dzień',
            bedDayPrice: '{price} / dzień / łóżko',
            femaleRoom: 'Pokój żenski',
            tenants: 'Lokatorzy:',
            join: 'Dołącz do pokoju'
        },
    },
    en: {
        header: {
            logoSubtitle: '[EN] i masz spanie!',
            callToAction: '[EN] Wynajmij i zarabiaj bez opłat',
            download: {
                firstLine: {
                    beforeLogo: '[EN] Pobierz naszą aplikację',
                    afterLogo: '[EN] na'
                },
                secondLine: '[EN] system Android i IOS'
            },
            login: '[EN] Zaloguj się'
        },
        footer: {
            callToAction: '[EN] Zostań wynajmującym bez opłat',
            informationSection: '[EN] Informacje',
            prices: '[EN] Ceny',
            cityList: '[EN] Lista miast',
            partnerProgram: '[EN] Program partnerski',
            faq: '[EN] Pytania i odpowiedzi Q&A',
            help: '[EN] Centrum pomocy',
            contact: '[EN] Kontakt',
            about: '[EN] O bed!OK',
            careers: '[EN] Kariera',
            information: '[EN] Informacje',
            termsOfCooperation: '[EN] Zasady współpracy',
            privacyPolicy: '[EN] Oświadczenie o ochronie prywatności i plikach cookies',
            cookies: '[EN] Zarządzaj ustawieniami dotyczącymi plików cookies',
            clientSection: '[EN] klient',
            login: '[EN] Logowanie',
            registration: '[EN] Rejestracja',
            specialOffers: '[EN] Oferty specjalne',
            copyrightsNote: {
                firstPart: '[EN] Prawa autorskie',
                year: '[EN] 2022',
                lastPart: '[EN] bed!Ok. Wszelkie prawa autorskie zastrzeżone.'
            }
        },
        homeView: {
            title: {
                firstLine: '[EN] Accommodation needed?',
                secondLine: '[EN] Wejdź na BedOK i masz spanie!',
            },
            looking: '[EN] szukam',
            offering: '[EN] oferuję',
            joinRoom: '[EN] NOWOŚĆ! Dołącz do pokoju',
            citiesTitle: '[EN] W którym mieście chcesz znaleźć nocleg?',
            howItWorks: '[EN] Jak to działa?',
            subscribe: '[EN] Zapisz się aby otrzymywać najświeższe informacje i promocje',
            freeAppLink: '[EN] Chcę otrzymać link do bezpłatnej aplikacji'
        },
        advertisementView: {
            header: '[EN] Dodaj ogłoszenie',
            mainSection: {
                title: {
                    label: '[EN] Tytuł ogłoszenia*',
                    tip: '[EN] od 7 do 70 znaków',
                    placeholder: '[EN] Np. Pokój dwuosobowy w cichej okolicy',
                    validationMessages: {
                        length: '[EN] Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                address: {
                    label: '[EN] Adres*',
                    cityPlaceholder: '[EN] Miasto',
                    zipCodePlaceholder: '[EN] Kod pocztowy',
                    streetPlaceholder: '[EN] Ulica',
                    streetNumberPlaceholder: '[EN] Nr domu',
                    flatNumberPlaceholder: '[EN] Nr lokalu',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                photos: {
                    label: '[EN] Zdjęcia*',
                    tip: '[EN] min. 1 szt. , max 8 szt.'
                }
            },
            hostSection: {
                hostName: {
                    label: '[EN] Nazwa gospodarza*',
                    placeholder: '[EN] Imię',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                phoneNumber: {
                    label: '[EN] Nr telefonu*',
                    placeholder: '[EN] Np. +48 000 000 000',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                email: {
                    label: '[EN] E-mail*',
                    placeholder: "Np. jan_kowalski{'@'}o2.pl",
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.',
                        email: '[EN] Nieprawdiłowy email'
                    }
                },
                photo: {
                    label: '[EN] Zdjęcie gospodarza'
                },
                languages: {
                    label: '[EN] Języki, którymi posługuje się gospodarz*',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                communicators: {
                    label: '[EN] Komunikatory, których używa gospodarz*',
                    tip: '[EN] Aplikacje do komnikacji przez internet',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                }
            },
            descriptionSection: {
                description: {
                    label: '[EN] Opis*',
                    tip: '[EN] maksimum 5000 znaków',
                    tabs: {
                        own: '[EN] Własny',
                        preset1: '[EN] Szablon 1',
                        preset2: '[EN] Szablon 2'
                    },
                    charactersCounter: '[EN] Pozostało {count} znaków'
                },
                roomSize: {
                    label: '[EN] Powierzchnia pokoju (m2)*',
                    placeholder: '[EN] np. 4.86',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                splitIntoBeds: {
                    label: '[EN] Pokój dzielony na łóżka',
                    value: '[EN] Podziel'
                },
                bedsCount: {
                    label: '[EN] Liczba łóżek w pokoju*',
                    placeholder: '[EN] np. 6',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                },
                roomType: {
                    label: '[EN] Typ pokoju'
                },
                freeBedsCount: {
                    label: '[EN] Liczba wolnych łóżek w pokoj*',
                    validationMessages: {
                        required: '[EN] To pole jest wymagane.'
                    }
                }
            },
            currentGuestsSection: {
                title: '[EN] Podaj informację o aktualnych lokatorach, tj. imię, wiek, języki, którymi się posługują',
                name: {
                    placeholder: '[EN] Imię'
                },
                birthYear: {
                    label: '[EN] Rok urodzenia*'
                }
            },
            paymentSection: {
                paymentMethod: {
                    label: '[EN] Formy płatności:'
                },
                pricing: {
                    label: '[EN] Ceny (zł):'
                },
                day: '[EN] doba',
                month: '[EN] miesiąc',
                shortRentRange: '[EN] Ilość dni (od 1 do 30 dni)',
                longRentRange: '[EN] Ilość miesięcy (powyżej 1 miesiąca)',
                addPriceRange: '[EN] Dodaj kolejny zakres cen'
            },
            rulesSection: {
                termsOfStay: '[EN] Zasady pobytu:',
                animals: '[EN] Akceptujemy zwierzęta:',
                curfew: '[EN] Cisza nocna (22:00 - 6:00):',
                smoking: '[EN] Palenie w budynku dozwolone:',
                others: {
                    label: '[EN] Inne:',
                    placeholder: '[EN] np. brak parkingu, grill w ogrodzie'
                }
            },
            equipmentSection: {
                roomEquipment: {
                    label: '[EN] Wyposażenie pokoju',
                    placeholder: '[EN] np. lampka, dywan'
                },
                sharedEquipment: {
                    label: '[EN] Wyposażenie strefy wspólnej',
                    placeholder: '[EN] np. lampka, dywan'
                }
            },
            actions: {
                preview: {
                    label: '[EN] Zobacz podgląd ogłoszenia',
                    tip: '[EN] (zobaczysz jak podgląd ogłoszenie przed jego publikacją)'
                },
                save: {
                    label: '[EN] Zapisz ogłoszenie',
                    tip: '[EN] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                publish: {
                    label: '[EN] Opublikuj ogłoszenie',
                    tip: '[EN] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                duplicate: {
                    label: '[EN] Zduplikuj ogłoszenie z wypełnionymi danymi',
                    tip: '[EN] (zaoszczędzisz czas dodając pokoje w tym samymy budynku)'
                }
            }
        },
        searchInput: {
            localization: {
                label: '[EN] Lokalizacja',
                placeholder: '[EN] Gdzie szukasz noclegu'
            },
            since: '[EN] Od kiedy',
            to: '[EN] Do kiedy',
            who: {
                label: '[EN] Kto',
                placeholder: '[EN] Ile osób'
            },
            search: '[EN] Szukaj'
        },
        roomCard: {
            district: '[EN] Dzielnica:',
            bedsInRoom: '[EN] {count} łóżka w pokoju',
            dayPrice: '[EN] {price} / dzień',
            bedDayPrice: '[EN] {price} / dzień / łóżko',
            femaleRoom: '[EN] Pokój żenski',
            tenants: '[EN] Lokatorzy:',
            join: '[EN] Dołącz do pokoju'
        },
    },
    de: {
        header: {
            logoSubtitle: '[DE] i masz spanie!',
            callToAction: '[DE] Wynajmij i zarabiaj bez opłat',
            download: {
                firstLine: {
                    beforeLogo: '[DE] Pobierz naszą aplikację',
                    afterLogo: '[DE] na'
                },
                secondLine: '[DE] system Android i IOS'
            },
            login: '[DE] Zaloguj się'
        },
        footer: {
            callToAction: '[DE] Zostań wynajmującym bez opłat',
            informationSection: '[DE] Informacje',
            prices: '[DE] Ceny',
            cityList: '[DE] Lista miast',
            partnerProgram: '[DE] Program partnerski',
            faq: '[DE] Pytania i odpowiedzi Q&A',
            help: '[DE] Centrum pomocy',
            contact: '[DE] Kontakt',
            about: '[DE] O bed!OK',
            careers: '[DE] Kariera',
            information: '[DE] Informacje',
            termsOfCooperation: '[DE] Zasady współpracy',
            privacyPolicy: '[DE] Oświadczenie o ochronie prywatności i plikach cookies',
            cookies: '[DE] Zarządzaj ustawieniami dotyczącymi plików cookies',
            clientSection: '[DE] klient',
            login: '[DE] Logowanie',
            registration: '[DE] Rejestracja',
            specialOffers: '[DE] Oferty specjalne',
            copyrightsNote: {
                firstPart: '[DE] Prawa autorskie',
                year: '[DE] 2022',
                lastPart: '[DE] bed!Ok. Wszelkie prawa autorskie zastrzeżone.'
            }
        },
        homeView: {
            title: {
                firstLine: '[DE] Unterkunft benötigt?',
                secondLine: '[DE] Wejdź na BedOK i masz spanie!',
            },
            looking: '[DE] szukam',
            offering: '[DE] oferuję',
            joinRoom: '[DE] NOWOŚĆ! Dołącz do pokoju',
            citiesTitle: '[DE] W którym mieście chcesz znaleźć nocleg?',
            howItWorks: '[DE] Jak to działa?',
            subscribe: '[DE] Zapisz się aby otrzymywać najświeższe informacje i promocje',
            freeAppLink: '[DE] Chcę otrzymać link do bezpłatnej aplikacji'
        },
        advertisementView: {
            header: '[DE] Dodaj ogłoszenie',
            mainSection: {
                title: {
                    label: '[DE] Tytuł ogłoszenia*',
                    tip: '[DE] od 7 do 70 znaków',
                    placeholder: '[DE] Np. Pokój dwuosobowy w cichej okolicy',
                    validationMessages: {
                        length: '[DE] Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                address: {
                    label: '[DE] Adres*',
                    cityPlaceholder: '[DE] Miasto',
                    zipCodePlaceholder: '[DE] Kod pocztowy',
                    streetPlaceholder: '[DE] Ulica',
                    streetNumberPlaceholder: '[DE] Nr domu',
                    flatNumberPlaceholder: '[DE] Nr lokalu',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                photos: {
                    label: '[DE] Zdjęcia*',
                    tip: '[DE] min. 1 szt. , max 8 szt.'
                }
            },
            hostSection: {
                hostName: {
                    label: '[DE] Nazwa gospodarza*',
                    placeholder: '[DE] Imię',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                phoneNumber: {
                    label: '[DE] Nr telefonu*',
                    placeholder: '[DE] Np. +48 000 000 000',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                email: {
                    label: '[DE] E-mail*',
                    placeholder: "Np. jan_kowalski{'@'}o2.pl",
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.',
                        email: '[DE] Nieprawdiłowy email'
                    }
                },
                photo: {
                    label: '[DE] Zdjęcie gospodarza'
                },
                languages: {
                    label: '[DE] Języki, którymi posługuje się gospodarz*',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                communicators: {
                    label: '[DE] Komunikatory, których używa gospodarz*',
                    tip: '[DE] Aplikacje do komnikacji przez internet',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                }
            },
            descriptionSection: {
                description: {
                    label: '[DE] Opis*',
                    tip: '[DE] maksimum 5000 znaków',
                    tabs: {
                        own: '[DE] Własny',
                        preset1: '[DE] Szablon 1',
                        preset2: '[DE] Szablon 2'
                    },
                    charactersCounter: '[DE] Pozostało {count} znaków'
                },
                roomSize: {
                    label: '[DE] Powierzchnia pokoju (m2)*',
                    placeholder: '[DE] np. 4.86',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                splitIntoBeds: {
                    label: '[DE] Pokój dzielony na łóżka',
                    value: '[DE] Podziel'
                },
                bedsCount: {
                    label: '[DE] Liczba łóżek w pokoju*',
                    placeholder: '[DE] np. 6',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                },
                roomType: {
                    label: '[DE] Typ pokoju'
                },
                freeBedsCount: {
                    label: '[DE] Liczba wolnych łóżek w pokoj*',
                    validationMessages: {
                        required: '[DE] To pole jest wymagane.'
                    }
                }
            },
            currentGuestsSection: {
                title: '[DE] Podaj informację o aktualnych lokatorach, tj. imię, wiek, języki, którymi się posługują',
                name: {
                    placeholder: '[DE] Imię'
                },
                birthYear: {
                    label: '[DE] Rok urodzenia*'
                }
            },
            paymentSection: {
                paymentMethod: {
                    label: '[DE] Formy płatności:'
                },
                pricing: {
                    label: '[DE] Ceny (zł):'
                },
                day: '[DE] doba',
                month: '[DE] miesiąc',
                shortRentRange: '[DE] Ilość dni (od 1 do 30 dni)',
                longRentRange: '[DE] Ilość miesięcy (powyżej 1 miesiąca)',
                addPriceRange: '[DE] Dodaj kolejny zakres cen'
            },
            rulesSection: {
                termsOfStay: '[DE] Zasady pobytu:',
                animals: '[DE] Akceptujemy zwierzęta:',
                curfew: '[DE] Cisza nocna (22:00 - 6:00):',
                smoking: '[DE] Palenie w budynku dozwolone:',
                others: {
                    label: '[DE] Inne:',
                    placeholder: '[DE] np. brak parkingu, grill w ogrodzie'
                }
            },
            equipmentSection: {
                roomEquipment: {
                    label: '[DE] Wyposażenie pokoju',
                    placeholder: '[DE] np. lampka, dywan'
                },
                sharedEquipment: {
                    label: '[DE] Wyposażenie strefy wspólnej',
                    placeholder: '[DE] np. lampka, dywan'
                }
            },
            actions: {
                preview: {
                    label: '[DE] Zobacz podgląd ogłoszenia',
                    tip: '[DE] (zobaczysz jak podgląd ogłoszenie przed jego publikacją)'
                },
                save: {
                    label: '[DE] Zapisz ogłoszenie',
                    tip: '[DE] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                publish: {
                    label: '[DE] Opublikuj ogłoszenie',
                    tip: '[DE] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                duplicate: {
                    label: '[DE] Zduplikuj ogłoszenie z wypełnionymi danymi',
                    tip: '[DE] (zaoszczędzisz czas dodając pokoje w tym samymy budynku)'
                }
            }
        },
        searchInput: {
            localization: {
                label: '[DE] Lokalizacja',
                placeholder: '[DE] Gdzie szukasz noclegu'
            },
            since: '[DE] Od kiedy',
            to: '[DE] Do kiedy',
            who: {
                label: '[DE] Kto',
                placeholder: '[DE] Ile osób'
            },
            search: '[DE] Szukaj'
        },
        roomCard: {
            district: '[DE] Dzielnica:',
            bedsInRoom: '[DE] {count} łóżka w pokoju',
            dayPrice: '[DE] {price} / dzień',
            bedDayPrice: '[DE] {price} / dzień / łóżko',
            femaleRoom: '[DE] Pokój żenski',
            tenants: '[DE] Lokatorzy:',
            join: '[DE] Dołącz do pokoju'
        },
    },
    uk: {
        header: {
            logoSubtitle: '[UK] i masz spanie!',
            callToAction: '[UK] Wynajmij i zarabiaj bez opłat',
            download: {
                firstLine: {
                    beforeLogo: '[UK] Pobierz naszą aplikację',
                    afterLogo: '[UK] na'
                },
                secondLine: '[UK] system Android i IOS'
            },
            login: '[UK] Zaloguj się'
        },
        footer: {
            callToAction: '[UK] Zostań wynajmującym bez opłat',
            informationSection: '[UK] Informacje',
            prices: '[UK] Ceny',
            cityList: '[UK] Lista miast',
            partnerProgram: '[UK] Program partnerski',
            faq: '[UK] Pytania i odpowiedzi Q&A',
            help: '[UK] Centrum pomocy',
            contact: '[UK] Kontakt',
            about: '[UK] O bed!OK',
            careers: '[UK] Kariera',
            information: '[UK] Informacje',
            termsOfCooperation: '[UK] Zasady współpracy',
            privacyPolicy: '[UK] Oświadczenie o ochronie prywatności i plikach cookies',
            cookies: '[UK] Zarządzaj ustawieniami dotyczącymi plików cookies',
            clientSection: '[UK] klient',
            login: '[UK] Logowanie',
            registration: '[UK] Rejestracja',
            specialOffers: '[UK] Oferty specjalne',
            copyrightsNote: {
                firstPart: '[UK] Prawa autorskie',
                year: '[UK] 2022',
                lastPart: '[UK] bed!Ok. Wszelkie prawa autorskie zastrzeżone.'
            }
        },
        homeView: {
            title: {
                firstLine: '[UK] Потрібне житло?',
                secondLine: '[UK] Wejdź na BedOK i masz spanie!',
            },
            looking: '[UK] szukam',
            offering: '[UK] oferuję',
            joinRoom: '[UK] NOWOŚĆ! Dołącz do pokoju',
            citiesTitle: '[UK] W którym mieście chcesz znaleźć nocleg?',
            howItWorks: '[UK] Jak to działa?',
            subscribe: '[UK] Zapisz się aby otrzymywać najświeższe informacje i promocje',
            freeAppLink: '[UK] Chcę otrzymać link do bezpłatnej aplikacji'
        },
        advertisementView: {
            header: '[UK] Dodaj ogłoszenie',
            mainSection: {
                title: {
                    label: '[UK] Tytuł ogłoszenia*',
                    tip: '[UK] od 7 do 70 znaków',
                    placeholder: '[UK] Np. Pokój dwuosobowy w cichej okolicy',
                    validationMessages: {
                        length: '[UK] Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                address: {
                    label: '[UK] Adres*',
                    cityPlaceholder: '[UK] Miasto',
                    zipCodePlaceholder: '[UK] Kod pocztowy',
                    streetPlaceholder: '[UK] Ulica',
                    streetNumberPlaceholder: '[UK] Nr domu',
                    flatNumberPlaceholder: '[UK] Nr lokalu',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                photos: {
                    label: '[UK] Zdjęcia*',
                    tip: '[UK] min. 1 szt. , max 8 szt.'
                }
            },
            hostSection: {
                hostName: {
                    label: '[UK] Nazwa gospodarza*',
                    placeholder: '[UK] Imię',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                phoneNumber: {
                    label: '[UK] Nr telefonu*',
                    placeholder: '[UK] Np. +48 000 000 000',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                email: {
                    label: '[UK] E-mail*',
                    placeholder: "Np. jan_kowalski{'@'}o2.pl",
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.',
                        email: '[UK] Nieprawdiłowy email'
                    }
                },
                photo: {
                    label: '[UK] Zdjęcie gospodarza'
                },
                languages: {
                    label: '[UK] Języki, którymi posługuje się gospodarz*',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                communicators: {
                    label: '[UK] Komunikatory, których używa gospodarz*',
                    tip: '[UK] Aplikacje do komnikacji przez internet',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                }
            },
            descriptionSection: {
                description: {
                    label: '[UK] Opis*',
                    tip: '[UK] maksimum 5000 znaków',
                    tabs: {
                        own: '[UK] Własny',
                        preset1: '[UK] Szablon 1',
                        preset2: '[UK] Szablon 2'
                    },
                    charactersCounter: '[UK] Pozostało {count} znaków'
                },
                roomSize: {
                    label: '[UK] Powierzchnia pokoju (m2)*',
                    placeholder: '[UK] np. 4.86',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                splitIntoBeds: {
                    label: '[UK] Pokój dzielony na łóżka',
                    value: '[UK] Podziel'
                },
                bedsCount: {
                    label: '[UK] Liczba łóżek w pokoju*',
                    placeholder: '[UK] np. 6',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                },
                roomType: {
                    label: '[UK] Typ pokoju'
                },
                freeBedsCount: {
                    label: '[UK] Liczba wolnych łóżek w pokoj*',
                    validationMessages: {
                        required: '[UK] To pole jest wymagane.'
                    }
                }
            },
            currentGuestsSection: {
                title: '[UK] Podaj informację o aktualnych lokatorach, tj. imię, wiek, języki, którymi się posługują',
                name: {
                    placeholder: '[UK] Imię'
                },
                birthYear: {
                    label: '[UK] Rok urodzenia*'
                }
            },
            paymentSection: {
                paymentMethod: {
                    label: '[UK] Formy płatności:'
                },
                pricing: {
                    label: '[UK] Ceny (zł):'
                },
                day: '[UK] doba',
                month: '[UK] miesiąc',
                shortRentRange: '[UK] Ilość dni (od 1 do 30 dni)',
                longRentRange: '[UK] Ilość miesięcy (powyżej 1 miesiąca)',
                addPriceRange: '[UK] Dodaj kolejny zakres cen'
            },
            rulesSection: {
                termsOfStay: '[UK] Zasady pobytu:',
                animals: '[UK] Akceptujemy zwierzęta:',
                curfew: '[UK] Cisza nocna (22:00 - 6:00):',
                smoking: '[UK] Palenie w budynku dozwolone:',
                others: {
                    label: '[UK] Inne:',
                    placeholder: '[UK] np. brak parkingu, grill w ogrodzie'
                }
            },
            equipmentSection: {
                roomEquipment: {
                    label: '[UK] Wyposażenie pokoju',
                    placeholder: '[UK] np. lampka, dywan'
                },
                sharedEquipment: {
                    label: '[UK] Wyposażenie strefy wspólnej',
                    placeholder: '[UK] np. lampka, dywan'
                }
            },
            actions: {
                preview: {
                    label: '[UK] Zobacz podgląd ogłoszenia',
                    tip: '[UK] (zobaczysz jak podgląd ogłoszenie przed jego publikacją)'
                },
                save: {
                    label: '[UK] Zapisz ogłoszenie',
                    tip: '[UK] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                publish: {
                    label: '[UK] Opublikuj ogłoszenie',
                    tip: '[UK] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                duplicate: {
                    label: '[UK] Zduplikuj ogłoszenie z wypełnionymi danymi',
                    tip: '[UK] (zaoszczędzisz czas dodając pokoje w tym samymy budynku)'
                }
            }
        },
        searchInput: {
            localization: {
                label: '[UK] Lokalizacja',
                placeholder: '[UK] Gdzie szukasz noclegu'
            },
            since: '[UK] Od kiedy',
            to: '[UK] Do kiedy',
            who: {
                label: '[UK] Kto',
                placeholder: '[UK] Ile osób'
            },
            search: '[UK] Szukaj'
        },
        roomCard: {
            district: '[UK] Dzielnica:',
            bedsInRoom: '[UK] {count} łóżka w pokoju',
            dayPrice: '[UK] {price} / dzień',
            bedDayPrice: '[UK] {price} / dzień / łóżko',
            femaleRoom: '[UK] Pokój żenski',
            tenants: '[UK] Lokatorzy:',
            join: '[UK] Dołącz do pokoju'
        },
    },
    ru: {
        header: {
            logoSubtitle: '[RU] i masz spanie!',
            callToAction: '[RU] Wynajmij i zarabiaj bez opłat',
            download: {
                firstLine: {
                    beforeLogo: '[RU] Pobierz naszą aplikację',
                    afterLogo: '[RU] na'
                },
                secondLine: '[RU] system Android i IOS'
            },
            login: '[RU] Zaloguj się'
        },
        footer: {
            callToAction: '[RU] Zostań wynajmującym bez opłat',
            informationSection: '[RU] Informacje',
            prices: '[RU] Ceny',
            cityList: '[RU] Lista miast',
            partnerProgram: '[RU] Program partnerski',
            faq: '[RU] Pytania i odpowiedzi Q&A',
            help: '[RU] Centrum pomocy',
            contact: '[RU] Kontakt',
            about: '[RU] O bed!OK',
            careers: '[RU] Kariera',
            information: '[RU] Informacje',
            termsOfCooperation: '[RU] Zasady współpracy',
            privacyPolicy: '[RU] Oświadczenie o ochronie prywatności i plikach cookies',
            cookies: '[RU] Zarządzaj ustawieniami dotyczącymi plików cookies',
            clientSection: '[RU] klient',
            login: '[RU] Logowanie',
            registration: '[RU] Rejestracja',
            specialOffers: '[RU] Oferty specjalne',
            copyrightsNote: {
                firstPart: '[RU] Prawa autorskie',
                year: '[RU] 2022',
                lastPart: '[RU] bed!Ok. Wszelkie prawa autorskie zastrzeżone.'
            }
        },
        homeView: {
            title: {
                firstLine: '[RU] Требуется проживание?',
                secondLine: '[RU] Wejdź na BedOK i masz spanie!',
            },
            looking: '[RU] szukam',
            offering: '[RU] oferuję',
            joinRoom: '[RU] NOWOŚĆ! Dołącz do pokoju',
            citiesTitle: '[RU] W którym mieście chcesz znaleźć nocleg?',
            howItWorks: '[RU] Jak to działa?',
            subscribe: '[RU] Zapisz się aby otrzymywać najświeższe informacje i promocje',
            freeAppLink: '[RU] Chcę otrzymać link do bezpłatnej aplikacji'
        },
        advertisementView: {
            header: '[RU] Dodaj ogłoszenie',
            mainSection: {
                title: {
                    label: '[RU] Tytuł ogłoszenia*',
                    tip: '[RU] od 7 do 70 znaków',
                    placeholder: '[RU] Np. Pokój dwuosobowy w cichej okolicy',
                    validationMessages: {
                        length: '[RU] Tytuł musi mieć min. 7 znaków, max. 70 znaków.',
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                address: {
                    label: '[RU] Adres*',
                    cityPlaceholder: '[RU] Miasto',
                    zipCodePlaceholder: '[RU] Kod pocztowy',
                    streetPlaceholder: '[RU] Ulica',
                    streetNumberPlaceholder: '[RU] Nr domu',
                    flatNumberPlaceholder: '[RU] Nr lokalu',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                photos: {
                    label: '[RU] Zdjęcia*',
                    tip: '[RU] min. 1 szt. , max 8 szt.'
                }
            },
            hostSection: {
                hostName: {
                    label: '[RU] Nazwa gospodarza*',
                    placeholder: '[RU] Imię',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                phoneNumber: {
                    label: '[RU] Nr telefonu*',
                    placeholder: '[RU] Np. +48 000 000 000',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                email: {
                    label: '[RU] E-mail*',
                    placeholder: "Np. jan_kowalski{'@'}o2.pl",
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.',
                        email: '[RU] Nieprawdiłowy email'
                    }
                },
                photo: {
                    label: '[RU] Zdjęcie gospodarza'
                },
                languages: {
                    label: '[RU] Języki, którymi posługuje się gospodarz*',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                communicators: {
                    label: '[RU] Komunikatory, których używa gospodarz*',
                    tip: '[RU] Aplikacje do komnikacji przez internet',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                }
            },
            descriptionSection: {
                description: {
                    label: '[RU] Opis*',
                    tip: '[RU] maksimum 5000 znaków',
                    tabs: {
                        own: '[RU] Własny',
                        preset1: '[RU] Szablon 1',
                        preset2: '[RU] Szablon 2'
                    },
                    charactersCounter: '[RU] Pozostało {count} znaków'
                },
                roomSize: {
                    label: '[RU] Powierzchnia pokoju (m2)*',
                    placeholder: '[RU] np. 4.86',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                splitIntoBeds: {
                    label: '[RU] Pokój dzielony na łóżka',
                    value: '[RU] Podziel'
                },
                bedsCount: {
                    label: '[RU] Liczba łóżek w pokoju*',
                    placeholder: '[RU] np. 6',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                },
                roomType: {
                    label: '[RU] Typ pokoju'
                },
                freeBedsCount: {
                    label: '[RU] Liczba wolnych łóżek w pokoj*',
                    validationMessages: {
                        required: '[RU] To pole jest wymagane.'
                    }
                }
            },
            currentGuestsSection: {
                title: '[RU] Podaj informację o aktualnych lokatorach, tj. imię, wiek, języki, którymi się posługują',
                name: {
                    placeholder: '[RU] Imię'
                },
                birthYear: {
                    label: '[RU] Rok urodzenia*'
                }
            },
            paymentSection: {
                paymentMethod: {
                    label: '[RU] Formy płatności:'
                },
                pricing: {
                    label: '[RU] Ceny (zł):'
                },
                day: '[RU] doba',
                month: '[RU] miesiąc',
                shortRentRange: '[RU] Ilość dni (od 1 do 30 dni)',
                longRentRange: '[RU] Ilość miesięcy (powyżej 1 miesiąca)',
                addPriceRange: '[RU] Dodaj kolejny zakres cen'
            },
            rulesSection: {
                termsOfStay: '[RU] Zasady pobytu:',
                animals: '[RU] Akceptujemy zwierzęta:',
                curfew: '[RU] Cisza nocna (22:00 - 6:00):',
                smoking: '[RU] Palenie w budynku dozwolone:',
                others: {
                    label: '[RU] Inne:',
                    placeholder: '[RU] np. brak parkingu, grill w ogrodzie'
                }
            },
            equipmentSection: {
                roomEquipment: {
                    label: '[RU] Wyposażenie pokoju',
                    placeholder: '[RU] np. lampka, dywan'
                },
                sharedEquipment: {
                    label: '[RU] Wyposażenie strefy wspólnej',
                    placeholder: '[RU] np. lampka, dywan'
                }
            },
            actions: {
                preview: {
                    label: '[RU] Zobacz podgląd ogłoszenia',
                    tip: '[RU] (zobaczysz jak podgląd ogłoszenie przed jego publikacją)'
                },
                save: {
                    label: '[RU] Zapisz ogłoszenie',
                    tip: '[RU] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                publish: {
                    label: '[RU] Opublikuj ogłoszenie',
                    tip: '[RU] (nadal będziesz mieć możliwość wprowadzenia zmian w dowolnym momencie)'
                },
                duplicate: {
                    label: '[RU] Zduplikuj ogłoszenie z wypełnionymi danymi',
                    tip: '[RU] (zaoszczędzisz czas dodając pokoje w tym samymy budynku)'
                }
            }
        },
        searchInput: {
            localization: {
                label: '[RU] Lokalizacja',
                placeholder: '[RU] Gdzie szukasz noclegu'
            },
            since: '[RU] Od kiedy',
            to: '[RU] Do kiedy',
            who: {
                label: '[RU] Kto',
                placeholder: '[RU] Ile osób'
            },
            search: '[RU] Szukaj'
        },
        roomCard: {
            district: '[RU] Dzielnica:',
            bedsInRoom: '[RU] {count} łóżka w pokoju',
            dayPrice: '[RU] {price} / dzień',
            bedDayPrice: '[RU] {price} / dzień / łóżko',
            femaleRoom: '[RU] Pokój żenski',
            tenants: '[RU] Lokatorzy:',
            join: '[RU] Dołącz do pokoju'
        },
    },
};

export default translations;
