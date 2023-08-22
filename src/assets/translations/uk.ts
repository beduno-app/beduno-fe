export default {
    header: {
        logoSubtitle: 'і маєш місце на нічліг!',
        callToAction: 'Орендуй і заробляй безкоштовно',
        download: {
            firstLine: {
                beforeLogo: 'Завантаж наш додаток',
                afterLogo: 'на'
            },
            secondLine: 'систему Android та IOS'
        },
        login: 'Увійти'
    },
    footer: {
        callToAction: 'Стань орендодавцем безкоштовно',
        informationSection: 'Інформація',
        prices: 'Ціни',
        cityList: 'Список міст',
        partnerProgram: 'Партнерська програма',
        faq: 'Питання та відповіді Q&A',
        help: 'Центр допомоги',
        contact: 'Контактна інформація',
        about: 'O bed!OK',
        careers: 'Кар\'єра',
        information: 'Інформація',
        termsOfCooperation: 'Правила співпраці',
        privacyPolicy: 'Заява про конфіденційність і файли cookies',
        cookies: 'Керування налаштуваннями файлів cookies',
        clientSection: 'клієнт',
        login: 'Вхід в систему',
        registration: 'Реєстрація',
        specialOffers: 'Спеціальні пропозиції',
        copyrightsNote: {
            firstPart: 'Авторські права',
            year: '2022',
            lastPart: 'bed!Ok. Всі авторські права захищені.'
        }
    },
    auth: {
        login: {
            login: 'Увійти',
            facebook: 'Увійти через facebook',
            google: 'Увійти через Google',
            email: {
                placeholder: 'Email'
            },
            password: {
                placeholder: 'Пароль'
            },
            phoneNumber: {
                placeholder: 'Номер телефону.'
            },
            forgotPassword: 'Не пам\'ятаю пароль',
            action: {
                login: 'УВІЙТИ',
                hint: 'Якщо у вас немає облікового запису, ви можете легко зареєструватися',
                register: 'СТВОРИТИ ОБЛІКОВИЙ ЗАПИС'
            },
        },
        register: {
            register: 'Створити обліковий запис простим способом',
            name: {
                placeholder: 'Ім\'я*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            phoneNumber: {
                placeholder: 'Номер телефону*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            email: {
                placeholder: 'Email*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            password: {
                placeholder: 'Пароль*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            repeatPassword: {
                placeholder: 'Повторіть пароль*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            birthYear: {
                label:  'Рік народження*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            gender: {
                label: 'Стать*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                },
                options: {
                    woman: "Жінка",
                    man: "Чоловік"
                },
            },
            languages: {
                label: 'Мови, якими ви спілкуєтесь*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            action: {
                hint: 'Якщо у Вас вже є обліковий запис, просто увійдіть'
            },
            generatePassword:'Створити пароль',
            acceptRegulation: {
                label: 'Я приймаю правила',
                link: 'натисніть тут, щоб ознайомитися з ними',
                error: '[UK] Zaakceptuj regulamin by kontynuować'
            }
        }
    },
    homeView: {
        title: {
            firstLine: 'Потрібне житло?',
            secondLine: 'Заходь на BedOK і вже маєш нічліг!',
        },
        looking: 'шукаю',
        offering: 'пропоную',
        joinRoom: 'Новинка! Приєднуйтесь до кімнати',
        citiesTitle: 'В якому місті ви хочете знайти нічліг?',
        howItWorks: 'Як це працює?',
        subscribe: 'Підпишіться, щоб отримувати останні новини та акції',
        freeAppLink: 'Я хочу отримати посилання на безкоштовний додаток'
    },
    advertisementView: {
        header: 'Додати оголошення',
        mainSection: {
            title: {
                label: 'Назва оголошення*',
                tip: 'від 7 до 70 символів',
                placeholder: 'Наприклад, двомісний номер в тихому районі',
                validationMessages: {
                    length: 'Назва повинна бути мін. 7 символів, макс. 70 символів.',
                    required: 'Це поле обов\'язкове.'
                }
            },
            address: {
                label: 'Адреса*',
                cityPlaceholder: 'Місто',
                zipCodePlaceholder: 'Поштовий індекс',
                streetPlaceholder: 'Вулиця',
                streetNumberPlaceholder: 'Номер будинку',
                flatNumberPlaceholder: 'Номер квартири',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            photos: {
                label: 'Фотографії*',
                tip: 'мін. 1 фото. , макс.8 фото.'
            }
        },
        hostSection: {
            hostName: {
                label: 'Назва орендодавця*',
                placeholder: 'Ім\'я',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            phoneNumber: {
                label: 'Номер телефону*',
                placeholder: 'Наприклад +48 000 000 000',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            email: {
                label: 'E-mail*',
                placeholder: "Наприклад jan_kowalski{'@'}o2.pl",
                validationMessages: {
                    required: 'Це поле обов\'язкове.',
                    email: 'Неправильний E-mail'
                }
            },
            photo: {
                label: 'Фото орендодавця'
            },
            languages: {
                label: 'Мови, на яких говорить орендодавець*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            communicators: {
                label: 'Соціальні мережі, які використовує орендодавець *',
                tip: 'Додатки для спілкування через Інтернет',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            }
        },
        descriptionSection: {
            description: {
                label: 'Опис*',
                tip: 'максимум 5000 символів',
                tabs: {
                    own: 'Власний',
                    preset1: 'Шаблон 1',
                    preset2: 'Шаблон 2'
                },
                charactersCounter: 'Залишилося {count} символів'
            },
            roomSize: {
                label: 'Площа мешкання (m2)*',
                placeholder: 'наприклад 4.86',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            splitIntoBeds: {
                label: 'Кімната, розділена на ліжка',
                value: 'Розділити'
            },
            bedsCount: {
                label: 'Кількість ліжок в номері*',
                placeholder: 'наприклад 6',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            },
            roomType: {
                label: 'Тип кімнати'
            },
            freeBedsCount: {
                label: 'Кількість вільних ліжок в кімнаті*',
                validationMessages: {
                    required: 'Це поле обов\'язкове.'
                }
            }
        },
        currentGuestsSection: {
            title: 'Надайте інформацію про поточних орендарів (проживаючих в кімнаті), тобто ім\'я, вік, мови, якими вони розмовляють',
            name: {
                placeholder: 'Ім\'я'
            },
            birthYear: {
                label: 'Рік народження*'
            }
        },
        paymentSection: {
            paymentMethod: {
                label: 'Способи оплати:'
            },
            pricing: {
                label: 'Ціна (zł):'
            },
            day: 'доба',
            discount1: 'Поріг знижки 1',
            discount2: 'Поріг знижки 2',
            discount3: 'Поріг знижки 3',
            discount4: 'Поріг знижки 4',
            discountMonth: 'Поріг знижки за проживання більше місяця',
        },
        rulesSection: {
            termsOfStay: 'Правила проживання:',
            animals: 'Приймаємо з домашніми тваринами:',
            curfew: 'Тиха година (22:00 - 6:00):',
            smoking: 'Куріння в будівлі дозволено:',
            others: {
                label: 'Інше:',
                placeholder: 'наприклад, немає парковки, барбекю в саду'
            }
        },
        equipmentSection: {
            roomEquipment: {
                label: 'Обладнання кімнати',
                placeholder: 'наприклад, лампа, килим'
            },
            sharedEquipment: {
                label: 'Обладнання загальної зони',
                placeholder: 'наприклад, лампа, килим'
            }
        },
        actions: {
            preview: {
                label: 'Переглянути попередній вигляд оголошення',
                tip: '(ви побачите, як виглядає оголошення перед його публікацією)'
            },
            save: {
                label: 'Зберегти оголошення',
                tip: '(ви все одно матимете можливість вносити зміни в будь-який час)'
            },
            publish: {
                label: 'Опублікувати оголошення',
                tip: '(ви все одно матимете можливість вносити зміни в будь-який час)'
            },
            duplicate: {
                label: 'Продублюйте оголошення із заповненими даними',
                tip: '(ви заощадите час, додавши кімнати в одній будівлі)'
            }
        }
    },
    advertisementDetailsView: {
        subheader: {
            markAsFavorite: 'Додати в обране',
            share: 'Поділитися'
        },
        descriptionWithMap: {
            description: 'Опис:',
            location: 'Локалізація'
        },
        host: {
            meetTheHost: 'ПОЗНАЙОМТЕСЯ З ГОСПОДАРЕМ (орендодавцем)',
            communicators: 'Я використовую такі додатки для зв\'язку:'
        },
        roomArea: 'Площа номера: {area} m2',
        currentTenants: 'В даний час у нас проживає:',
        currentTenantsCount: 'Кількість людей, які проживають в даний момент в кімнаті:',
        seeOtherEquipment: 'Переглянути інші зручності',
        sharedArea: 'Загальна зона: лобі, кухня, ванна кімната',
        roomSplitToBeds: 'Кімната, розділена на ліжка',
        sharedRoom: 'Спільно з іншими мешканцями',
        roomEquipment: 'Обладнання кімнати:',
        sharedEquipment: 'Обладнання спільної частини:',
        paymentMethods: 'Способи оплати:',
        rulesOfStay: 'Правила проживання:',
        pricePerBed: 'Ціна за ліжко {price} {currency} ({duration})',
        book: 'Забронювати ліжко',
        beds: '{count} ліжок',
        rooms: '{count} кімнат'
    },
    hostAdvertisementsView: {
        myAdvertisements: 'Мої оголошення',
        expertPanel: 'Панель EXPERT',
        active: 'Активне',
        inactive: 'Неактивне',
        addNewAd: 'Додати нове оголошення',
        freeBeds: 'Вільно: {count} ліжок',
        messages: 'Повідомлення:',
        newMessagesCount: '{count} непрочитані',
        editAd: 'Редагувати оголошення',
        createFromCurrent: 'Створіть нове оголошення на основі поточного',
        createFromCurrentHint: '(ви заощадите час, додавши кімнати в тій же будівлі)',
        deactivateAd: 'Деактивувати оголошення',
        deactivateAdHint: '(оголошення перейде в розділ Неактивні )',
        publishAd: 'Опублікувати оголошення',
        publishAdHint: '(ви як і раніше будете мати можливість вносити зміни в будь-який час)',
        removeAd: 'Видалити оголошення',
        removeAdHint: '(оголошення буде видалено)'
    },
    expertPanelView: {
        removeTenant: 'Видалити мешканця',
        addTenant: 'Додай мешканця',
        removeAllTenants: 'Видали усіх мешканців',
        editAd: 'Редагувати оголошення',
        createAdFromCurrent: 'Створіть нове оголошення на основі поточного',
        expertPanel: 'Панель EXPERT',
        myAdvertisements: 'Мої оголошення:',
        address: 'Адреса:',
        room: 'Кімната:',
        occupiedBeds: 'Зайняті ліжка:',
        freeBeds: 'Вільні ліжка:',
        currentTenants: 'Актуальні мешканці:',
        createAd: 'Додати нове оголошення'
    },
    becomeHostView: {
        list: {
            item1 : 'Стати орендодавцем безкоштовно',
            item2 : 'Використовуйте зручну форму управління своєю нерухомістю',
            item3: 'Безпечніше орендувати ліжка з гарантією до 2000 злотих',
            item4: 'Отримайте безкоштовну юридичну допомогу'
        },
        action : {
            add: 'Додати оголошення',
            hint: 'І насолоджуйтесь безпечною орендою'
        }
    },
    searchInput: {
        location: {
            label: 'Локалізація',
            placeholder: 'Де ви шукаєте нічліг'
        },
        since: 'Від коли',
        to: 'До коли',
        who: {
            label: 'Хто',
            placeholder: 'Скільки людей'
        },
        search: 'Пошук'
    },
    roomCard: {
        district: 'Район:',
        bedsInRoom: '{count} ліжок у кімнаті',
        dayPrice: '{price} zł / в день',
        bedDayPrice: '{price} zł / в день/ за ліжко',
        femaleRoom: 'Жіноча кімната',
        maleRoom: 'Чоловіча кімната',
        otherGenderRoom: 'Змішана кімната',
        tenants: 'Мешканці:',
        tenantInfo: '{name}, років {age}',
        join: 'Приєднуйтесь до кімнати'
    },
    order: {
        header: 'Підсумок замовлення:',
        currentGuests: 'На даний час мешкає:',
        totalAmount: 'Загальна сума для оплати: {price}{currency} ({duration} ніч)',
        host: 'Орендодавець:',
        hint: 'Точна адреса та вказівки доїзду до місця проживання будуть\nдоступні після оплати.',
        proceedToPayment: 'Перейти до оплати'
    },
    blog: {
        header: 'Блог та новини',
        published: 'Опубліковано: {date}',
        readMore: '...читати далі',
        feed: {
            firstLine: 'Пропонуємо вам ознайомитися з останніми новинами про',
            secondLine: 'Ми рекомендуємо вам стежити за цією сторінкою, тому що тут з\'являються\nважливі повідомлення про функціонування сайту, зміни і заплановані роботи\nрозробку. Ми також публікуємо наші офіційні прес-релізи.',
            thirdLine: 'Крім того, в цьому розділі ми регулярно пропонуємо нашим клієнтам\n(орендодавцям і орендарям) отримати практичну інформацію про ринок\nнерухомості. Зверніть увагу, що блог носить не тільки освітній,\nа й розважальний характер. Проте, напевно кожен, хто цікавиться темою\nпомешкання, знайде тут щось для себе.',
            title: 'Що у на нового',
            subtitle: 'Блог та новини',
            loadMore: 'Завантажити попередні повідомлення...'
        }
    },
    about: {
        header: 'Про нас',
        firstLine: 'це\nінноваційний веб-сервіс який швидко розвивається та оперативно\nвикористовує новітні технології (m.in.AI) для опису наданих нами\nпослуг. Ми пов\'язуємо пошук та розміщення (гостей) з особами, що\nпропонують розміщення (господарями).Замість традиційної формули\nпропозиції кімнат, ми робимо ставку на односпальні кімнати та окремі\nліжка-найбільш вигідні з можливих рішень з точки зору\nяк орендодавця, так і орендаря.',
        secondLine: {
            firstPart: 'Дякуємо',
            secondPart: 'ви швидко знайдете дешевий нічліг.'
        },
        thirdLine: 'Вам потрібен нічліг прямо зараз,за низькою ціною, в хорошому місці, у\nнадійного орендодавця? Ви потрапили в потрібне місце!',
        fourthLine: 'Незалежно від того, чи хочете ви провести одну ніч або шукаєте щос на\nцілий рік або довше, у нас ви відразу знайдете це місце.'
    },
    career: {
        header: 'Кар\'єра',
        firstLine: {
            firstPart: 'в',
            secondPart: 'ми робимо ставку на людей. Ми віримо в їхні амбіції, мотивацію до\nрозвитку та бажання шукати свій професійний шлях. Ми запрошуємо Вас\nподати заявку (початківців і фахівців) -\nякі поділяють наші цінності:залученість, систематичність, гарне ставлення до іншої людини.',
        },
        secondLine: {
            firstPart: 'Нижче наведені поточні вакансії та посадові інструкції, на які ми\nшукаємо кандидатів. Навіть якщо в даний момент ми не ведемо жодного\nнабору персоналу, ми рекомендуємо вам подати заявку. Якщо ви\nвідчуваєте, що вписуєтеся в атмосферу стартапу',
            secondPart: ', заповніть форму нижче і розкажіть нам більше про себе - може виявитися, що ми дійсно на одному шляху.'
        },
        thirdLine: {
            firstPart: 'Увага для студентів та повнолітніх учнів середніх шкіл! Якщо ви шукаєте\nцінну професійну практику, в якій ви можете отримати конкретні знання\n досвід і навчитися чомусь дійсно, Ласкаво просимо!',
            secondPart: 'Програма стажування та практики в нашому сартапі-чудовий початок\nвашої майбутньої професійної кар\'єри.'
        },
        roles: {
            juniorDev: 'Junior developer - Молодший Розробник',
            keyAccountManager: 'Key account manager - Менеджер по роботі з ключовими клієнтами',
            photo: 'Fotograf - Фотограф'
        }
    },
    contact: {
        header: 'Контакт',
        firstLine: 'Не соромтеся звертатися до нас. На більшість запитів ми відповідаємо на постійній основі.\nМи обробляємо більш складні питання протягом максимум 2 робочих днів.',
        secondLine: 'Найшвидший спосіб дістатися до нашого сервісного центру-скористатися\nформою нижче. З питань співпраці, бізнес-пропозицій та запитів, які\nбезпосередньо не стосуються функціонування сайту, просимо Вас\nнадіслати повідомлення за адресою:',
        thirdLine: {
            firstPart: 'Журналістів та представників ЗМІ запрошуємо зв\'язатися з нашим\nпрес-відділом: співпраця, ділові пропозиції та запити, які безпосередньо\nне стосуються функціонування сайту, просимо надіслати повідомлення за\nадресою:',
            secondPart: 'За додатковою інформацією звертайтеся в розділ ЗМІ - Media.'
        },
        form: {
            name: {
                label: 'Введіть своє ім\'я:*',
                placeholder: 'Ім\'я',
                validationMessages: {
                    required: 'Ім\'я необхідне.'
                }
            },
            phone: {
                label: 'Номер телефону:*',
                placeholder: 'Наприклад: +48 000 000 000',
                validationMessages: {
                    required: 'Номер телефону необхідний.'
                }
            },
            email: {
                label: 'Email:*',
                placeholder: 'Наприклад jan{at}kowalski.com',
                validationMessages: {
                    required: 'Email необхідний.',
                    email: 'Неправильний формат електронної пошти.'
                }
            },
            message: {
                label: 'Напишіть нам повідомлення:*',
                placeholder: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                validationMessages: {
                    required: 'Повідомлення необхідне.'
                }
            },
            hint: 'Введення цієї інформації є обов\'язковим*',
            send: 'Надіслати повідомлення'
        }
    },
    help: {
        header: 'Довідка (FAQ)',
        firstLine: {
            firstPart: 'Тут ми представляємо список найбільш поширених питань, які задають\nкористувачі нашого сайту, і відповіді, які допоможуть їм вирішити дану\nпроблему.Просимо вас ознайомитися з ними, перш ніж звертатися до нас\nза допомогою. З досвіду ми знаємо, що тут є понад 95% проблем, про які\nповідомляють користувачі',
            secondPart: 'є простими для вирішиення самостійно завдяки наведеним нижче\nпоясненням і порадам.'
        },
        howTo: 'Як це працює',
        qna: 'Питання і відповіді,',
        questions: {
            howToGetAccount: {
                q: 'Як створити обліковий запис в сервісі',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            dataNeededToRegister: {
                q: 'Які дані Я повинен надати під час реєстрації?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howDoPaymentsWork: {
                q: 'Як здійснюються платежі орендодавцю?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howToBeSafe: {
                q: 'Як забезпечити свою безпеку при пошуку житла?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            }
        }
    },
    media: {
        header: 'ЗМІ - Media',
        firstLine: 'Будь-які запити від журналістів, в тому числі бажання отримати Експертний\nвисновок або інтерв\'ю, є для нас пріоритетними. Ми до ваших послуг за\nадресою:',
        secondLine: 'Звертаємо Вашу увагу, що всі матеріали на сайті bedOk захищені\nавторськими та майновими правами. Для їх використання в публікації,\nбудь ласка, зв\'яжіться з нами заздалегідь в письмовій формі (по електронній\nпошті) і узгодьте деталі. Зокрема, це стосується використання логотипів,\nвикористання фотографій і відео, а також розміщених текстів. Будь-яке\nвикористання цих матеріалів вимагає попереднього дозволу.',
        thirdLine: 'Якщо ви пропонуєте взяти участь у заході або проекті, придбати\nспонсорований контент (в тому числі рекламу) і будь-які інші комерційні\nпропозиції, будь ласка, повідомте нам подробиці:',
        details: {
            title: 'назва і видавець-відповідальний суб\'єкт',
            reach: 'перевіряється покриття',
            contact: 'контактні дані (e-mail, телефон) учасника торгів',
            duration: 'формат і тривалість пропозиції',
            benefit: 'конкретизація переваг'
        },
        fourthLine: {
            firstPart: 'Публікуємо повідомлення в розділі',
            secondPart: ' "Блог та новини"',
            thirdPart: '- сайт також є офіційним джерелом наших прес-релізів.'
        }
    }
};
