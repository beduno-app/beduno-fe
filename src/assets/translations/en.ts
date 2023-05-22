export default {
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
    auth: {
        login: {
            login: '[EN] Zaloguj się',
            facebook: '[EN] Zaloguj się przez facebook',
            google: '[EN] Zaloguj się przez Google',
            email: {
                placeholder: '[EN] Email'
            },
            password: {
                placeholder: '[EN] Hasło'
            },
            phoneNumber: {
                placeholder: '[EN] Nr tel.'
            },
            forgotPassword: '[EN] Zapomniałem hasła',
            action: {
                login: '[EN] ZALOGUJ SIĘ',
                hint: '[EN] Jeśli nie posiadasz u nas konta, możesz się w prosty sposób zarejestrować',
                register: '[EN] ZAŁÓŻ KONTO'
            },
        },
        register: {
            register: '[EN] Załóż konto w prosty sposób',
            name: {
                placeholder: '[EN] Imię*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            phoneNumber: {
                placeholder: '[EN] Nr tel.*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            email: {
                placeholder: '[EN] Email*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            password: {
                placeholder: '[EN] Hasło*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            repeatPassword: {
                placeholder: '[EN] Powtórz hasło*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            birthYear: {
                label:  'Rok urodzenia*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            gender: {
                label: '[EN] Płeć*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                },
                options: {
                    woman: "Kobieta",
                    man: "Mężczyzna"
                },
            },
            languages: {
                label: '[EN] Języki w któryh się komunikujesz*',
                validationMessages: {
                    required: '[EN] To pole jest wymagane.'
                }
            },
            action: {
                hint: '[EN] Jeśli już posiadasz u nas konto, po prostu się zaloguj'
            },
            generatePassword:'Wygeneruj hasło',
            acceptRegulation: {
                label: '[EN] Akceptuję regulamin',
                link: '[EN] kliknij tutaj, aby się z nim zapoznać'
            }
        }
    },
    homeView: {
        title: {
            firstLine: '[EN] Potrzebne zakwaterowanie?',
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
            discount1: '[EN] Próg zniżkowy 1',
            discount2: '[EN] Próg zniżkowy 2',
            discount3: '[EN] Próg zniżkowy 3',
            discount4: '[EN] Próg zniżkowy 4',
            discountMonth: '[EN] Próg zniżkowy powyżej miesiąca',
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
    advertisementDetailsView: {
        subheader: {
            markAsFavorite: '[EN] Dodaj do ulubionych',
            share: '[EN] Udostępnij'
        },
        descriptionWithMap: {
            description: '[EN] Opis:',
            location: '[EN] Lokalizacja'
        },
        host: {
            meetTheHost: '[EN] POZNAJ GOSPODARZA',
            communicators: '[EN] Używam:'
        },
        roomArea: '[EN] Powierzchnia pokoju: {area} m2',
        currentTenants: '[EN] Aktualnie u nas mieszka:',
        currentTenantsCount: '[EN] Liczba osób aktualnie zamieszkujących pokój:',
        seeOtherEquipment: '[EN] Zobacz pozostałe udogodnienia',
        sharedArea: '[EN] Część wspólna: lobby, kuchnia, łazienka',
        roomSplitToBeds: '[EN] Pokój dzielony na łóżka',
        sharedRoom: '[EN] Współdzielony z innymi mieszkańcami',
        roomEquipment: '[EN] Wyposażenie pokoju:',
        sharedEquipment: '[EN] Wyposażenie części wspólnej:',
        paymentMethods: '[EN] Metody płatności:',
        rulesOfStay: '[EN] Zasady pobytu:',
        pricePerBed: '[EN] Cena za łóżko {price} {currency} ({duration})',
        book: '[EN] Zarezerwuj łóżko',
        beds: '[EN] {count} łóżka',
        rooms: '[EN] {count} pokoje'
    },
    hostAdvertisementsView: {
        myAdvertisements: '[EN] Moje ogłoszenia',
        expertPanel: '[EN] Panel EXPERT',
        active: '[EN] Aktywne',
        inactive: '[EN] Nieaktywne',
        addNewAd: '[EN] Dodaj nowe ogłoszenie',
        freeBeds: '[EN] Wolne: {count} łóżka',
        messages: '[EN] Wiadomości:',
        newMessagesCount: '[EN] {count} nieprzeczytanych',
        editAd: '[EN] Edytuj ogłoszenie',
        createFromCurrent: '[EN] Stwórz nowe ogłoszenie na podstawie obecnego',
        createFromCurrentHint: '[EN] (zaoszczędzisz czas dodając pokoje w tym samym budynku)',
        deactivateAd: '[EN] Zakończ ogłoszenie',
        deactivateAdHint: '[EN] (ogłoszenie przejdzie do sekcji Nieaktywne)',
        publishAd: '[EN] Opublikuj ogłoszenie',
        publishAdHint: '[EN] (nadal będziesz miał/a możliwość wprowadzania zmian w dowolnym momencie)',
        removeAd: '[EN] Usuń ogłoszenie',
        removeAdHint: '[EN] (ogłoszenie zostanie usunięte)'
    },
    expertPanelView: {
        removeTenant: '[EN] Usuń lokatora',
        addTenant: '[EN] Dodaj lokatora',
        removeAllTenants: '[EN] Usuń wszystkich lokatorów',
        editAd: '[EN] Edytuj ogłoszenie',
        createAdFromCurrent: '[EN] Stwórz nowe ogłoszenie na podstawie obecnego',
        expertPanel: '[EN] Panel EXPERT',
        myAdvertisements: '[EN] Moje ogłoszenia:',
        address: '[EN] Adres:',
        room: '[EN] Pokój:',
        occupiedBeds: '[EN] Zajęte łóżka:',
        freeBeds: '[EN] Wolne łóżka:',
        currentTenants: '[EN] Aktualni lokatorzy:',
        createAd: '[EN] Dodaj nowe ogłoszenie'
    },
    becomeHostView: {
        list: {
            item1 : '[EN] Zostań Wynajmującym bez opłat',
            item2 : '[EN] Korzystaj z wygodnej formy zarządzania swoją nieruchomością',
            item3: '[EN] Bezpieczniej wynajmuj łóżka z gwarancja do 2000 PLN',
            item4: '[EN] Uzyskaj bezpłatną pomoc prawną'
        },
        action : {
            add: '[EN] Dodaj ogłoszenie',
            hint: '[EN] I ciesz się bezpiecznym wynajmem'
        }
    },
    searchInput: {
        location: {
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
        dayPrice: '[EN] {price} zł / dzień',
        bedDayPrice: '[EN] {price} zł / dzień / łóżko',
        femaleRoom: '[EN] Pokój żenski',
        maleRoom: '[EN] Pokój męski',
        otherGenderRoom: '[EN] Pokój mieszany',
        tenants: '[EN] Lokatorzy:',
        tenantInfo: '[EN] {name}, lat {age}',
        join: '[EN] Dołącz do pokoju'
    },
    order: {
        header: '[EN] Podsumowanie zamówienia:',
        currentGuests: '[EN] Aktualnie zamieszkany przez:',
        totalAmount: '[EN] Całkowita kwota do zapłaty: {price}{currency} ({duration} noce)',
        host: '[EN] Gospodarz:',
        hint: '[EN] Dokładny adres i wskazówki dojazdu do miejsca zamieszkania zostaną\nudostępnione po dokonaniu płatności.',
        proceedToPayment: '[EN] Przejdź do płatności'
    },
    blog: {
        header: '[EN] Blog i aktualności',
        published: '[EN] Opublikowano: {date}',
        readMore: '[EN] ...czytaj dalej',
        feed: {
            firstLine: '[EN] Zapraszmy do zapoznania się z najnowszymi wiadomościami o',
            secondLine: '[EN] Zachęcamy do śledzenia tej strony, ponieważ pojawiają się tutaj ważne\nkomunikaty o funkcjonowaniu serwisu, zmianach oraz planowanych pracach\nrozwojowych. Zamieszczamy też również nasze oficjalne informacje prasowe.',
            thirdLine: '[EN] Ponadto w niniejszym dziale regularnie publikujemy naszym klientom\n(wynajmującym i najemcom) zdobyć praktyczne informacje na temat rynku\nnieruchomości. Prosimy jednak pamiętać, że blok ma charakter nie tylko\nedukacyjny, ale także rozrywkowy. Niemniej jednak na pewno każdy\nzainteresowany tematem mieszkalnictwa znajdzie na nim coś dla siebie.',
            title: '[EN] Co u nas słychać',
            subtitle: '[EN] Blog i aktualności',
            loadMore: '[EN] Wczytaj starsze wiadomości...'
        }
    },
    about: {
        header: '[EN] O nas',
        firstLine: '[EN] to\ninnowacyjny i szybko rozwijający się serwis internetowy, niezwołocznie\nadoptujący i wykorzystujący najnowsze technologie (m.in.AI) do\nopytmalizacji świadczonych przez siebie usług. Łączymy poszukujących\nzakwaterownaia (gości) z osobami oferującymi noclegi (gospodarzami).\nZamiast tradycyjnej formuły oferowania pokojów, my stawiamy na pojedyncze\nłóżka - najbardziej opłacalne z możliwych rozwiązań z punktu widzenia\nzarówno wynajmnującego, jak i najemcy.',
        secondLine: {
            firstPart: '[EN] Dzięki',
            secondPart: '[EN] szybko znajdziesz tani nocleg.'
        },
        thirdLine: '[EN] Potrzebujesz łóżka od zaraz, w niskiej cenie, w dobrej lokalizacji, u\nwiarygodnego wynajmnującego? Dobrze trafiłeś!',
        fourthLine: '[EN] Nieważne czy chcesz spędzić jedną noc, czy szukasz czegoś na cały rok lub\ndłużej, u nas od razu znajdziesz takie miejsce.'
    },
    career: {
        header: '[EN] Kariera',
        firstLine: {
            firstPart: '[EN] W',
            secondPart: '[EN] stawiamy na ludzi. Wierzymy w ich ambicję, motywację do rozwoju oraz chęć\nposzukiwania własniej drogi zawodowej. Zapraszmy do aplikowania osoby -\npoczątkujących oraz specjalistów - które podzielają nasze wartości:\nzaangażownanie, systematyczność, stosunek do drugiej osoby.',
        },
        secondLine: {
            firstPart: '[EN] Poniżej znadują się aktualne oferty pracy i opisy stanowisk, na które\nszukamy kandydatów. Nawet jeśli w danej chwili nie prowadzimy żadnej\nrekrutacji, zachęcamy do aplikowania. Jeśli czujesz, że pasujesz do\nklimatu startupowego',
            secondPart: '[EN] , wypełnij poniższy formularz i powiedz nam coś więcej na swój temat -\nmoże okazać się, że jest nam naprawdę po drodze.'
        },
        thirdLine: {
            firstPart: '[EN] Uwaga studenci i pełnoletni uczniowe szkół ponadpodstawowych. Jeśli\nposzukujecie wartościowych praktyk zawodowych, podczas których możecie\nzdobyć konkretną wiedzę, doświadczenie i nauczyć się czegoś rzeczywiście\ndobrze, zapraszamy do',
            secondPart: '[EN] Program staży i praktyk zawodowych w naszym sartupie to doskonały\npoczątek Waszej przyszłej kariery profesjonalnej.'
        },
        roles: {
            juniorDev: '[EN] Junior developer',
            keyAccountManager: '[EN] Key account manager',
            photo: '[EN] Fotograf'
        }
    },
    contact: {
        header: '[EN] Kontakt',
        firstLine: '[EN] Zachęcamy do kontaktu z nami. Na większość zapytań odpowiadamy na bieżąco.\nBardziej złożone kwestie obsługujemy w ciągu maksymalnie 2 dni roboczych.',
        secondLine: '[EN] Najszybszym sposobem dotarcia do naszego Biura Obsługi jest skorzystanie z\nponiższego formularza. W sprawie współpracy, propozycji biznesowych i\nzapytań, które bezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie\nprosimy o przesłanie wiadomości na adres:',
        thirdLine: {
            firstPart: '[EN] Dziennikarzy i przedstawicieli mediów zapraszamy do kontaktu z naszym\nbiurem prasowym: współpracy, propozycji biznesowych i zapytań, które\nbezpośrednio nie dotyczą funkcjonowaniu serwisu, uprzejmie prosimy o\nprzesłanie wiadomości na adres:',
            secondPart: '[EN] Po wiecej informacji zapraszamy do sekcji Media.'
        },
        form: {
            name: {
                label: '[EN] Wpisz swoje imię:*',
                placeholder: '[EN] Imię',
                validationMessages: {
                    required: '[EN] Imię jest wymagane.'
                }
            },
            phone: {
                label: '[EN] Nr telefonu:*',
                placeholder: '[EN] np.: +48 000 000 000',
                validationMessages: {
                    required: '[EN] Numer telefonu jest wymagany.'
                }
            },
            email: {
                label: '[EN] Email:*',
                placeholder: '[EN] np. jan{at}kowalski.com',
                validationMessages: {
                    required: '[EN] Email jest wymagany.',
                    email: '[EN] Niepoprawny format adresu email.'
                }
            },
            message: {
                label: '[EN] Napisz do nas wiadomość:*',
                placeholder: '[EN] Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                validationMessages: {
                    required: '[EN] Wiadomość jest wymagana.'
                }
            },
            hint: '[EN] Wpisanie tych informacji jest obowiązkowe*',
            send: '[EN] Wyślij wiadomość'
        }
    },
    help: {
        header: '[EN] Pomoc (FAQ)',
        firstLine: {
            firstPart: '[EN] Prezentujemy tu listę najczęstszych pytań jakie zadają użytkownicy naszego\nserwisu oraz odpowiedzi, które mają im pomóc rozwiązać dany problem.\nUprzejmie prosimy o zapoznanie się z nimi zanim zwrócą sie Państwa do nas\no pomoc. Z doświadczenia wiemy, że ponad 95% problemów, które zgłaszają\nużytkownicy',
            secondPart: '[EN] jest prosta do samodzielnego rozwiązania właśnie dzięki poniższym\nwyjaśnieniom oraz wskazówkom.'
        },
        howTo: '[EN] Jak to działa',
        qna: '[EN] Pytania i odpowiedzi,',
        questions: {
            howToGetAccount: {
                q: '[EN] Jak założyć konto w serwisie',
                a: '[EN] Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            dataNeededToRegister: {
                q: '[EN] Jakie dane muszę muszę podać przy rejestracji?',
                a: '[EN] Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howDoPaymentsWork: {
                q: '[EN] Jak dokonywane są płatności na rzecz gospodarza?',
                a: '[EN] Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howToBeSafe: {
                q: '[EN] W jaki sposób dbać o swoje bezpieczeństwo szukając noclegu?',
                a: '[EN] Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            }
        }
    },
    media: {
        header: '[EN] Media',
        firstLine: '[EN] Wszelkie zapytania od dziennikarzy, w tym chęć uzyskania wypowiedzi\neksperckiej czy przeprowadzenia wywiadu, mają dla nas charakter\npriorytetowy. Jesteśmy do Państwa dyspozycji pod adresem:',
        secondLine: '[EN] Informujemy, że wszystkie materiały w serwisie bedOk chronione są prawami\nautorskimi i majątkowymi. W celu ich wykorzystania w publikacji prosimy o\nwcześniejszy kontakt pisemny (mailowy) i uzgodnienie szczegółów. W\nszczególności dotyczy to użycia logotypów, wykorzystania zdjęć i\nmateriałów video oraz zamieszczonych tekstów. Każde wykorzystanie tych\nmateriałów wymaga wcześniejszej autoryzacji.',
        thirdLine: '[EN] W przypadku propozycji objęcia patronatem danego wydarzenia czy projektu,\nzakupi treści sponsorowanych (w tym reklam) oraz jakichkolwiek innych\nofert komercyjnych, prosimy o szczegółowe informacje, m.in.:',
        details: {
            title: '[EN] tytuł i wydawca - podmot odpowedzialny',
            reach: '[EN] weryfikowalny zasięg',
            contact: '[EN] dane kontaktowe (e-mail, telefon) oferenta',
            duration: '[EN] format i czas trwania oferty',
            benefit: '[EN] konkretyzacja świadczeń'
        },
        fourthLine: {
            firstPart: '[EN] Komunikaty publikujemy w części',
            secondPart: '[EN]  "Blog i aktualności"',
            thirdPart: '[EN] - strona jest również oficjalnym źródłem naszych informacji prasowych.'
        }
    }
};
