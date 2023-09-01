export default {
    header: {
       logoSubtitle: 'И уже имеешь ночлег!',
        callToAction: 'Арендуйте и зарабатывайте бесплатно',
        download: {
            firstLine: {
                beforeLogo: 'Загрузите наше приложение',
                afterLogo: 'на'
            },
            secondLine: 'системы Android и IOS'
        },
        login: 'Войти'
    },
    footer: {
        callToAction: 'Стань арендодателем бесплатно',
        informationSection: 'Информация',
        prices: 'Цены',
        cityList: 'Список городов',
        partnerProgram: 'Партнерская программа',
        faq: 'Вопросы и ответы Q&A',
        help: 'Справочный центр',
        contact: 'Контакты',
        about: 'O bed!OK',
        careers: 'Карьера',
        information: 'Информация',
        termsOfCooperation: 'Правила сотрудничества',
        privacyPolicy: 'Заявление о конфиденциальности и cookies',
        cookies: 'Управление настройками файлов cookies',
        clientSection: 'Клиент',
        login: 'Вход в систему',
        registration: 'Регистрация',
        specialOffers: 'Специальные предложения',
        copyrightsNote: {
            firstPart: 'Авторские права',
            year: '2022',
            lastPart: 'bed!Ok. Все авторские права защищены.'
        }
    },
    auth: {
        login: {
            login: 'Войти',
            facebook: 'Войти через facebook',
            google: 'Войти через Google',
            email: {
                placeholder: 'Email'
            },
            password: {
                placeholder: 'Пароль'
            },
            phoneNumber: {
                placeholder: 'Номер телефона.'
            },
            forgotPassword: 'Не помню пароль',
            action: {
                login: 'ВОЙТИ',
                hint: 'Если у вас нет учетной записи, вы можете легко зарегистрироваться',
                register: 'СОЗДАТЬ УЧЕТНУЮ ЗАПИСЬ'
            },
        },
        register: {
            register: 'Создать учетную запись простым способом',
            name: {
                placeholder: 'Имя*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            phoneNumber: {
                placeholder: 'Номер телефона*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            email: {
                placeholder: 'Email*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            password: {
                placeholder: 'Пароль*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            repeatPassword: {
                placeholder: 'Повторите пароль*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            birthYear: {
                label:  'Год рождения*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            gender: {
                label: 'Пол*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                },
                options: {
                    woman: "Женщина",
                    man: "Мужчина"
                },
            },
            languages: {
                label: 'Языки, на которых вы общаетесь*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            action: {
                hint: 'Если у вас уже есть учетная запись с нами, просто войдите в систему'
            },
            generatePassword:'Создать пароль',
            acceptRegulation: {
                label: 'Я принимаю правила',
                link: 'нажмите здесь, чтобы ознакомиться с ними',
                error: '[RU] Zaakceptuj regulamin by kontynuować'
            }
        }
    },
    homeView: {
        title: {
           firstLine: 'Нужно жилье?',
            secondLine: 'Зайди на BedOK и уже имеешь ночлег!',
        },
        looking: 'ищу',
        offering: 'предлагаю',
        joinRoom: 'Новинка! Присоединяйтесь в комнату',
        citiesTitle: 'В каком городе вы хотите найти жилье?',
        howItWorks: 'Как это работает?',
        subscribe: 'Подпишитесь, чтобы получать последние новости и акции',
        freeAppLink: 'Я хочу получить ссылку на бесплатное приложение'
    },
    advertisements: {
        emptyListHint: '[RU] Brak ogłoszeń spełniających kryteria'
    },
    advertisementView: {
        header: 'Добавить объявление',
        mainSection: {
            title: {
                label: 'Название объявления*',
                tip: 'от 7 до 70 символов',
                placeholder: 'Например, двухместный номер в тихом районе',
                validationMessages: {
                    length: 'Название должно быть мин. 7 символов, макс. 70 символов.',
                    required: 'Это поле обязательно.'
                }
            },
            address: {
                label: 'Адрес*',
                cityPlaceholder: 'Город',
                zipCodePlaceholder: 'Индекс',
                streetPlaceholder: 'Улица',
                streetNumberPlaceholder: 'Номер дома',
                flatNumberPlaceholder: 'Номер квартиры',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            photos: {
                label: 'Фотографии*',
                tip: 'мин. 1 шт. , макс 8 шт.'
            }
        },
        hostSection: {
            hostName: {
                label: 'Название арендодателя*',
                placeholder: 'Имя',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            phoneNumber: {
                label: 'Номер телефона*',
                placeholder: 'Например. +48 000 000 000',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            email: {
                label: 'E-mail*',
                placeholder: "Например. jan_kowalski{'@'}o2.pl",
                validationMessages: {
                    required: 'Это поле обязательно.',
                    email: 'Неверный адрес электронной почты'
                }
            },
            photo: {
                label: 'Фото арендодателя'
            },
            languages: {
                label: 'Языки, на которых говорит арендодатель*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            communicators: {
                label: 'Мессенджеры, которые использует арендодатель*',
                tip: 'Приложения для общения через интернет',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            }
        },
        descriptionSection: {
            description: {
                label: 'Описание*',
                tip: 'максимум 5000 символов',
                tabs: {
                    own: 'Собственный',
                    preset1: 'Шаблон 1',
                    preset2: 'Шаблон 2'
                },
                charactersCounter: 'Осталось {count} символов'
            },
            roomSize: {
                label: 'Площадь жилья (m2)*',
                placeholder: 'например. 4.86',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            splitIntoBeds: {
                label: 'Комната, разделенная на кровати',
                value: 'Разделить'
            },
            bedsCount: {
                label: 'Количество кроватей в комнате*',
                placeholder: 'например. 6',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            },
            roomType: {
                label: 'Тип комнаты'
            },
            freeBedsCount: {
                label: 'Количество свободных кроватей в комнате*',
                validationMessages: {
                    required: 'Это поле обязательно.'
                }
            }
        },
        currentGuestsSection: {
            title: 'Предоставьте информацию о текущих арендаторах, т. е. имя, возраст, языки, на которых они говорят',
            name: {
                placeholder: 'Имя*'
            },
            birthYear: {
                label: 'Год рождения*'
            }
        },
        paymentSection: {
            paymentMethod: {
                label: 'Способы оплаты:'
            },
            pricing: {
                label: 'Цены(zł):'
            },
            day: 'сутки',
            discount1: 'Порог скидки1',
            discount2: 'Порог скидки 2',
            discount3: 'Порог скидки 3',
            discount4: 'Порог скидки 4',
            discountMonth: 'Порог скидки проживания более месяца',
        },
        rulesSection: {
            termsOfStay: 'Правила проживания:',
            animals: 'Принимаем с домашними животными:',
            curfew: 'Тихий час (22:00 - 6:00):',
            smoking: 'Курение в здании разрешено:',
            others: {
                label: 'Другое:',
                placeholder: 'например, нет парковки, барбекю в саду'
            }
        },
        equipmentSection: {
            roomEquipment: {
                label: 'Оборудование комнаты',
                placeholder: 'например, лампа, ковер'
            },
            sharedEquipment: {
                label: 'Оборудование общей зоны',
                placeholder: 'например, лампа, ковер'
            }
        },
        actions: {
            preview: {
                label: 'Предварительный просмотр объявления',
                tip: '(вы увидите, как выглядит объявление перед его публикацией)'
            },
            edit: {
                label: '[RU] Edytuj ogłoszenie',
                tip: '[RU] (edytuj utworzone ogłoszenie)'
            },
            save: {
                label: 'Сохранить объявление',
                tip: '(у вас по-прежнему будет возможность вносить изменения в любое время)'
            },
            publish: {
                label: 'Опубликовать объявление',
                tip: '(у вас по-прежнему будет возможность вносить изменения в любое время)'
            },
            duplicate: {
                label: 'Продублируйте объявление с заполненными данными',
                tip: '(вы сэкономите время, добавив комнаты в одном здании)'
            }
        }
    },
    advertisementDetailsView: {
        subheader: {
            markAsFavorite: 'Добавить в избранное',
            share: 'Поделиться'
        },
        descriptionWithMap: {
            description: 'Описание:',
            location: 'Расположение'
        },
        host: {
            meetTheHost: 'ПОЗНАКОМЬТЕСЬ С АРЕНДОДАТЕЛЕМ',
            communicators: 'Я использую:'
        },
        roomArea: 'Площадь номера: {area} m2',
        currentTenants: 'В настоящее время у нас живет:',
        currentTenantsCount: 'Количество людей, проживающих в данный момент в комнате:',
        seeOtherEquipment: 'Посмотреть другие удобства',
        sharedArea: 'Общая зона: лобби, кухня, ванная комната',
        roomSplitToBeds: 'Комната, разделенная на кровати',
        sharedRoom: 'Совместно с другими жителями',
        roomEquipment: 'Оборудование комнаты:',
        sharedEquipment: 'Оборудование общей части:',
        paymentMethods: 'Способы оплаты:',
        rulesOfStay: 'Правила проживания:',
        pricePerBed: 'Цена за кровать {price} {currency} ({duration})',
        totalPrice: '[RU] Do zapłaty ({from} - {to}, {guestsCount} gości): {totalPrice} {currency}',
        book: 'Забронировать кровать',
        beds: '{count} кровати',
        rooms: '{count} комнаты'
    },
    hostAdvertisementsView: {
        myAdvertisements: 'Мои объявления',
        expertPanel: 'Панель Эксперт',
        active: 'Активные',
        inactive: 'Неактивные',
        addNewAd: 'Добавить новое объявление',
        freeBeds: 'Свободно: {count} кроватей',
        messages: 'Сообщения:',
        newMessagesCount: '{count} непрочитанных',
        editAd: 'Редактировать объявление',
        createFromCurrent: 'Создайте новое объявление на основе текущего',
        createFromCurrentHint: '(вы сэкономите время, добавив комнаты в том же здании)',
        deactivateAd: 'Деактивировать объявление',
        deactivateAdHint: '(объявление перейдет в неактивный раздел)',
        publishAd: 'Опубликовать объявление',
        publishAdHint: '(вы по-прежнему будете иметь возможность вносить изменения в любое время)',
        removeAd: 'Удалить объявление',
        removeAdHint: '(объявление будет удалено)'
    },
    expertPanelView: {
        removeTenant: 'Удалить арендатора',
        addTenant: 'Добавить арендатора',
        removeAllTenants: 'Удалить всех арендаторов',
        editAd: 'Редактировать объявление',
        createAdFromCurrent: 'Создайте новое объявление на основе текущего',
        expertPanel: 'Панель Эксперт',
        myAdvertisements: 'Мои объявления:',
        address: 'Адрес:',
        room: 'Комната:',
        occupiedBeds: 'Занятые кровати:',
        freeBeds: 'Свободные кровати:',
        currentTenants: 'Текущие арендаторы:',
        createAd: 'Добавить новое объявление'
    },
    becomeHostView: {
        list: {
            item1 : 'Стать арендодателем бесплатно',
            item2 : 'Используйте удобную форму управления своей недвижимостью',
            item3: 'Безопаснее арендовать кровати с гарантией до 2000 злотых',
            item4: 'Получите бесплатную юридическую помощь'
        },
        action : {
            add: 'Добавить объявление',
            hint: 'И наслаждайтесь безопасной арендой'
        }
    },
    searchInput: {
        location: {
           label: 'Расположение',
            placeholder: 'Где вы ищете жилье'
        },
        since: 'От когда',
        to: 'До когда',
        who: {
            label: 'Кто',
            placeholder: 'Сколько человек'
        },
        search: 'Поиск'
    },
    roomCard: {
        district: 'Район:',
        bedsInRoom: '{count} кроватей в номере',
        dayPrice: '{price} zł / день',
        bedDayPrice: '{price} zł / день / кровать',
        femaleRoom: 'Женская комната',
        maleRoom: 'Мужская комната',
        otherGenderRoom: 'Смешанная комната',
        tenants: 'Арендаторы:',
        tenantInfo: '{name}, лет {age}',
        join: 'Присоединяйтесь в комнату'
    },
    order: {
        header: 'Итог заказа:',
        currentGuests: 'В настоящее время проживают:',
        totalAmount: 'Общая сумма к оплате: {price}{currency} ({duration} ночей)',
        host: 'Арендодатель:',
        noGuests: '[RU] W tej chwili nie ma innych gości.',
        hint: 'Точный адрес и инструкции доезда к месту жительств будут\nпредоставлены после оплаты.',
        proceedToPayment: 'Перейти к оплате'
    },
    blog: {
        header: 'Блог и новости',
        published: 'Опубликовано: {date}',
        readMore: '...читать дальше',
        feed: {
            firstLine: 'Предлагаем вам ознакомиться с последними новостями о',
            secondLine: 'Мы рекомендуем Вам следить за этой страницей, так как здесь появляются\nважные сообщения о функционировании сайта, изменениях и планируемых\nразработках. Мы также публикуем наши официальные пресс-релизы.',
            thirdLine: 'Кроме того, в этом разделе мы регулярно публикуем нашим клиентам\n(арендодателям и арендаторам) получить практическую информацию о рынке\nнедвижимости. Обратите внимание, что блог носит не только образовательный,\nно и развлекательный характер. Тем не менее, наверняка каждый, кто\nинтересуется темой жилищного строительства, найдет на нем что-то для себя',
            title: 'Что у нас нового',
            subtitle: 'Блог и новости',
            loadMore: 'Загрузить старые сообщения...'
        }
    },
    about: {
        header: 'О нас',
        firstLine: 'это\nинновационный и быстро развивающийся интернет-сервис, быстро\nвнедряющий и использующий новейшие технологии (m.in.AI) для\nоптимизации предоставляемых ими услуг. Мы связываем ищущих жилье\n(гостей) с людьми, предлагающими жилье (хозяевами). Вместо традиционной\nформулы предложения комнат, мы делаем ставку на односпальные\nкровати-наиболее выгодные из возможных решений с точки зрения как\nарендодателя, так и арендатора.',
        secondLine: {
            firstPart: 'Благодаря нам',
            secondPart: 'ты быстро найдешь недорогой ночлег.'
        },
        thirdLine: 'Вам нужен ночлег прямо сейчас, по низкой цене, в хорошем месте, у\nнадежного арендодателя? Вы попали в нужное место!',
        fourthLine: 'Независимо от того, хотите ли вы провести тут одну ночь или ищете\nчто-то на целый год или дольше, у нас вы сразу найдете такое место.'
    },
    career: {
        header: 'Карьера',
        firstLine: {
            firstPart: 'W',
            secondPart: '. Мы стараемся для людей! Мы верим в их амбиции, мотивацию к развитию\nи желание искать свой собственный профессиональный путь. Приглашаем\nк применению людей начинающих и специалистов-которые разделяют наши\nценности: приверженность, систематичность, хорошее отношение к другим людям.',
        },
        secondLine: {
            firstPart: 'Ниже приведены текущие вакансии на которые мы ищем кандидатов. Даже\nесли в данный момент у нас нет набора персонала, мы рекомендуем Вам\nподать заявку. Если вы чувствуете, что вписываетесь в атмосферу\nстартапа',
            secondPart: ', заполните форму ниже и расскажите нам больше о себе..'
        },
        thirdLine: {
            firstPart: 'Внимание для студентов и совершеннолетних учащихся средних школ! Если\nвы ищете ценную профессиональную практику, в ходе которой вы можете\nполучить конкретные знания, опыт и научиться чему-то действительно\nхорошо, мы приглашаем вас',
            secondPart: 'Программа стажировок и практики в нашем стартапе - отличное начало\nвашей будущей профессиональной карьеры.'
        },
        roles: {
            juniorDev: 'Junior developer - Младший разработчик',
            keyAccountManager: 'Key account manager - Менеджер по работе с ключевыми клиентами',
            photo: 'Fotograf - Фотограф'
        }
    },
    contact: {
        header: 'Контактная информация',
        firstLine: 'Не стесняйтесь обращаться к нам. На большинство запросов мы отвечаем на\nпостоянной основе. Мы обрабатываем более сложные вопросы в течение максимум 2 рабочих дней.',
        secondLine: 'Самый быстрый способ связаться с нашим сервисным центром -использовать\nформу ниже. О сотрудничестве, деловых предложениях и запросах, которые\nнепосредственно не касаются функционирования сайта, просим вас\nотправить сообщение по адресу:',
        thirdLine: {
            firstPart: 'Журналистов и представителей СМИ приглашаем связаться с нашим\nпресс-отделом: сотрудничество, деловые предложения и запросы, которые\nнапрямую не касаются функционирования сайта, просим отправить сообщение\nпо адресу:',
            secondPart: 'За дополнительной информацией обращайтесь в раздел СМИ - Media.'
        },
        form: {
            name: {
                  label: 'Введите свое имя:*',
                placeholder: 'Имя',
                validationMessages: {
                    required: 'требуется указать Имя .'
                }
            },
            phone: {
                label: 'Номер телефона:*',
                placeholder: 'например.: +48 000 000 000',
                validationMessages: {
                    required: 'требуется указать Номер телефона.'
                }
            },
            email: {
                label: 'Email:*',
                placeholder: 'например. jan{at}kowalski.com',
                validationMessages: {
                    required: 'требуется указатьEmail.',
                    email: 'Неправильный формат адреса электронной почты.'
                }
            },
            message: {
                label: 'Напишите нам сообщение:*',
                placeholder: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                validationMessages: {
                    required: 'сообщение обязательно.'
                }
            },
            hint: 'Ввод этой информации является обязательным*',
            send: 'Отправить сообщение'
        }
    },
    help: {
        header: 'Помощь (FAQ)',
        firstLine: {
            firstPart: 'Здесь мы представляем список наиболее распространенных вопросов,\nкоторые задают пользователи нашего сайта, и ответы, которые помогут им\nрешить данную проблему. Просим Вас ознакомиться с ними, прежде чем\nобращаться к нам за помощью. По опыту мы знаем, что тут есть более 95%\nпроблем, о которых сообщают пользователи',
            secondPart: 'ее легко решить самостоятельно благодаря приведенным ниже\nобъяснениям и советам.'
        },
        howTo: 'Как это работает',
        qna: 'Вопросы и ответы,',
        questions: {
            howToGetAccount: {
                q: 'Как создать учетную запись в сервисе',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            dataNeededToRegister: {
                q: 'Какие данные я должен предоставить при регистрации?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howDoPaymentsWork: {
                q: 'Как производятся платежи арендодателю?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howToBeSafe: {
                q: 'Как обеспечить свою безопасность при поиске жилья?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            }
        }
    },
    media: {
        header: 'Media - СМИ',
        firstLine: 'Любые запросы от журналистов, в том числе желание получить экспертное\nзаключение или интервью, являются для нас приоритетными. Мы к вашим\nуслугам по адресу:',
        secondLine: 'Обращаем ваше внимание, что все материалы на сайте bedOk защищены\nавторскими и имущественными правами. Для их использования в публикации,\nпожалуйста, свяжитесь с нами заранее в письменной форме (по электронной\nпочте) и согласуйте детали. В частности, это касается использования\nлоготипов, использования фотографий и видео, а также размещенных\nтекстов. Любое использование этих материалов требует предварительного разрешения.',
        thirdLine: 'Если вы предлагаете принять участие в мероприятии или проекте, приобрести\nспонсируемый контент (в том числе рекламу) и любые другие коммерческие\nпредложения, пожалуйста, сообщите нам подробности.:',
        details: {
            title: 'название и издатель - ответственный субъект',
            reach: 'проверяемое покрытие',
            contact: 'контактные данные (e-mail, телефон) участника',
            duration: 'формат и продолжительность предложения',
            benefit: 'конкретизация преимуществ'
        },
        fourthLine: {
            firstPart: 'Мы публикуем сообщения в части',
            secondPart: ' "Блог и новости"',
            thirdPart: '- сайт также является официальным источником наших пресс-релизов.'
        }
    }
};
