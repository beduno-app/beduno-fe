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
            },
        },
        register: {
            register: 'Załóż konto w prosty sposób',
            name: {
                placeholder: 'Imię*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            phoneNumber: {
                placeholder: 'Nr tel.*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            email: {
                placeholder: 'Email*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            password: {
                placeholder: 'Hasło*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            repeatPassword: {
                placeholder: 'Powtórz hasło*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            birthYear: {
                label:  'Rok urodzenia*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            gender: {
                label: 'Płeć*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                },
                options: {
                    woman: "Kobieta",
                    man: "Mężczyzna"
                },
            },
            languages: {
                label: 'Języki w któryh się komunikujesz*',
                validationMessages: {
                    required: 'To pole jest wymagane.'
                }
            },
            action: {
                hint: 'Jeśli już posiadasz u nas konto, po prostu się zaloguj'
            },
            generatePassword:'Wygeneruj hasło',
            acceptRegulation: {
                label: 'Akceptuję regulamin',
                link: 'kliknij tutaj, aby się z nim zapoznać',
                error: 'Zaakceptuj regulamin by kontynuować'
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
    advertisements: {
      emptyListHint: 'Brak ogłoszeń spełniających kryteria'
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
            discount1: 'Próg zniżkowy 1',
            discount2: 'Próg zniżkowy 2',
            discount3: 'Próg zniżkowy 3',
            discount4: 'Próg zniżkowy 4',
            discountMonth: 'Próg zniżkowy powyżej miesiąca',
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
            edit: {
                label: 'Edytuj ogłoszenie',
                tip: '(edytuj utworzone ogłoszenie)'
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
        totalPrice: 'Do zapłaty ({from} - {to}, {guestsCount} gości): {totalPrice} {currency}',
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
    becomeHostView: {
        list: {
            item1 : 'Zostań Wynajmującym bez opłat',
            item2 : 'Korzystaj z wygodnej formy zarządzania swoją nieruchomością',
            item3: 'Bezpieczniej wynajmuj łóżka z gwarancja do 2000 PLN',
            item4: 'Uzyskaj bezpłatną pomoc prawną'
        },
        action : {
            add: 'Dodaj ogłoszenie',
            hint: 'I ciesz się bezpiecznym wynajmem'
        }
    },
    searchInput: {
        location: {
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
        tenantInfo: '{name}, lat {age}',
        join: 'Dołącz do pokoju'
    },
    order: {
        header: 'Podsumowanie zamówienia:',
        currentGuests: 'Aktualnie zamieszkany przez:',
        totalAmount: 'Całkowita kwota do zapłaty: {price}{currency} ({duration} noce)',
        host: 'Gospodarz:',
        noGuests: 'W tej chwili nie ma innych gości.',
        hint: 'Dokładny adres i wskazówki dojazdu do miejsca zamieszkania zostaną\nudostępnione po dokonaniu płatności.',
        proceedToPayment: 'Przejdź do płatności'
    },
    blog: {
        header: 'Blog i aktualności',
        published: 'Opublikowano: {date}',
        readMore: '...czytaj dalej',
        feed: {
            firstLine: 'Zapraszmy do zapoznania się z najnowszymi wiadomościami o',
            secondLine: 'Zachęcamy do śledzenia tej strony, ponieważ pojawiają się tutaj ważne\nkomunikaty o funkcjonowaniu serwisu, zmianach oraz planowanych pracach\nrozwojowych. Zamieszczamy też również nasze oficjalne informacje prasowe.',
            thirdLine: 'Ponadto w niniejszym dziale regularnie publikujemy naszym klientom\n(wynajmującym i najemcom) zdobyć praktyczne informacje na temat rynku\nnieruchomości. Prosimy jednak pamiętać, że blok ma charakter nie tylko\nedukacyjny, ale także rozrywkowy. Niemniej jednak na pewno każdy\nzainteresowany tematem mieszkalnictwa znajdzie na nim coś dla siebie.',
            title: 'Co u nas słychać',
            subtitle: 'Blog i aktualności',
            loadMore: 'Wczytaj starsze wiadomości...'
        }
    },
    about: {
        header: 'O nas',
        firstLine: 'to\ninnowacyjny i szybko rozwijający się serwis internetowy, niezwołocznie\nadoptujący i wykorzystujący najnowsze technologie (m.in.AI) do\nopytmalizacji świadczonych przez siebie usług. Łączymy poszukujących\nzakwaterownaia (gości) z osobami oferującymi noclegi (gospodarzami).\nZamiast tradycyjnej formuły oferowania pokojów, my stawiamy na pojedyncze\nłóżka - najbardziej opłacalne z możliwych rozwiązań z punktu widzenia\nzarówno wynajmnującego, jak i najemcy.',
        secondLine: {
            firstPart: 'Dzięki',
            secondPart: 'szybko znajdziesz tani nocleg.'
        },
        thirdLine: 'Potrzebujesz łóżka od zaraz, w niskiej cenie, w dobrej lokalizacji, u\nwiarygodnego wynajmnującego? Dobrze trafiłeś!',
        fourthLine: 'Nieważne czy chcesz spędzić jedną noc, czy szukasz czegoś na cały rok lub\ndłużej, u nas od razu znajdziesz takie miejsce.'
    },
    career: {
        header: 'Kariera',
        firstLine: {
            firstPart: 'W',
            secondPart: 'stawiamy na ludzi. Wierzymy w ich ambicję, motywację do rozwoju oraz chęć\nposzukiwania własniej drogi zawodowej. Zapraszmy do aplikowania osoby -\npoczątkujących oraz specjalistów - które podzielają nasze wartości:\nzaangażownanie, systematyczność, stosunek do drugiej osoby.',
        },
        secondLine: {
            firstPart: 'Poniżej znadują się aktualne oferty pracy i opisy stanowisk, na które\nszukamy kandydatów. Nawet jeśli w danej chwili nie prowadzimy żadnej\nrekrutacji, zachęcamy do aplikowania. Jeśli czujesz, że pasujesz do\nklimatu startupowego',
            secondPart: ', wypełnij poniższy formularz i powiedz nam coś więcej na swój temat -\nmoże okazać się, że jest nam naprawdę po drodze.'
        },
        thirdLine: {
            firstPart: 'Uwaga studenci i pełnoletni uczniowe szkół ponadpodstawowych. Jeśli\nposzukujecie wartościowych praktyk zawodowych, podczas których możecie\nzdobyć konkretną wiedzę, doświadczenie i nauczyć się czegoś rzeczywiście\ndobrze, zapraszamy do',
            secondPart: 'Program staży i praktyk zawodowych w naszym sartupie to doskonały\npoczątek Waszej przyszłej kariery profesjonalnej.'
        },
        roles: {
            juniorDev: 'Junior developer',
            keyAccountManager: 'Key account manager',
            photo: 'Fotograf'
        }
    },
    contact: {
        header: 'Kontakt',
        firstLine: 'Zachęcamy do kontaktu z nami. Na większość zapytań odpowiadamy na bieżąco.\nBardziej złożone kwestie obsługujemy w ciągu maksymalnie 2 dni roboczych.',
        secondLine: 'Najszybszym sposobem dotarcia do naszego Biura Obsługi jest skorzystanie z\nponiższego formularza. W sprawie współpracy, propozycji biznesowych i\nzapytań, które bezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie\nprosimy o przesłanie wiadomości na adres:',
        thirdLine: {
            firstPart: 'Dziennikarzy i przedstawicieli mediów zapraszamy do kontaktu z naszym\nbiurem prasowym: współpracy, propozycji biznesowych i zapytań, które\nbezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie prosimy o\nprzesłanie wiadomości na adres:',
            secondPart: 'Po wiecej informacji zapraszamy do sekcji Media.'
        },
        form: {
            name: {
                label: 'Wpisz swoje imię:*',
                placeholder: 'Imię',
                validationMessages: {
                    required: 'Imię jest wymagane.'
                }
            },
            phone: {
                label: 'Nr telefonu:*',
                placeholder: 'np.: +48 000 000 000',
                validationMessages: {
                    required: 'Numer telefonu jest wymagany.'
                }
            },
            email: {
                label: 'Email:*',
                placeholder: 'np. jan{at}kowalski.com',
                validationMessages: {
                    required: 'Email jest wymagany.',
                    email: 'Niepoprawny format adresu email.'
                }
            },
            message: {
                label: 'Napisz do nas wiadomość:*',
                placeholder: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                validationMessages: {
                    required: 'Wiadomość jest wymagana.'
                }
            },
            hint: 'Wpisanie tych informacji jest obowiązkowe*',
            send: 'Wyślij wiadomość'
        }
    },
    help: {
        header: 'Pomoc (FAQ)',
        firstLine: {
            firstPart: 'Prezentujemy tu listę najczęstszych pytań jakie zadają użytkownicy naszego\nserwisu oraz odpowiedzi, które mają im pomóc rozwiązać dany problem.\nUprzejmie prosimy o zapoznanie się z nimi zanim zwrócą sie Państwa do nas\no pomoc. Z doświadczenia wiemy, że ponad 95% problemów, które zgłaszają\nużytkownicy',
            secondPart: 'jest prosta do samodzielnego rozwiązania właśnie dzięki poniższym\nwyjaśnieniom oraz wskazówkom.'
        },
        howTo: 'Jak to działa',
        qna: 'Pytania i odpowiedzi,',
        questions: {
            howToGetAccount: {
                q: 'Jak założyć konto w serwisie',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            dataNeededToRegister: {
                q: 'Jakie dane muszę muszę podać przy rejestracji?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howDoPaymentsWork: {
                q: 'Jak dokonywane są płatności na rzecz gospodarza?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howToBeSafe: {
                q: 'W jaki sposób dbać o swoje bezpieczeństwo szukając noclegu?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            }
        }
    },
    media: {
        header: 'Media',
        firstLine: 'Wszelkie zapytania od dziennikarzy, w tym chęć uzyskania wypowiedzi\neksperckiej czy przeprowadzenia wywiadu, mają dla nas charakter\npriorytetowy. Jesteśmy do Państwa dyspozycji pod adresem:',
        secondLine: 'Informujemy, że wszystkie materiały w serwisie bedOk chronione są prawami\nautorskimi i majątkowymi. W celu ich wykorzystania w publikacji prosimy o\nwcześniejszy kontakt pisemny (mailowy) i uzgodnienie szczegółów. W\nszczególności dotyczy to użycia logotypów, wykorzystania zdjęć i\nmateriałów video oraz zamieszczonych tekstów. Każde wykorzystanie tych\nmateriałów wymaga wcześniejszej autoryzacji.',
        thirdLine: 'W przypadku propozycji objęcia patronatem danego wydarzenia czy projektu,\nzakupi treści sponsorowanych (w tym reklam) oraz jakichkolwiek innych\nofert komercyjnych, prosimy o szczegółowe informacje, m.in.:',
        details: {
            title: 'tytuł i wydawca - podmot odpowedzialny',
            reach: 'weryfikowalny zasięg',
            contact: 'dane kontaktowe (e-mail, telefon) oferenta',
            duration: 'format i czas trwania oferty',
            benefit: 'konkretyzacja świadczeń'
        },
        fourthLine: {
            firstPart: 'Komunikaty publikujemy w części',
            secondPart: ' "Blog i aktualności"',
            thirdPart: '- strona jest również oficjalnym źródłem naszych informacji prasowych.'
        }
    }
};
