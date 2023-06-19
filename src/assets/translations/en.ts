export default {
    header: {
        logoSubtitle: 'and you got your bed!',
        callToAction: 'Rent out and make money without additional fees',
        download: {
            firstLine: {
                beforeLogo: 'Get our app',
                afterLogo: 'for'
            },
            secondLine: 'Android or IOS'
        },
        login: 'Log in'
    },
    footer: {
        callToAction: 'Start renting out with no additional fees',
        informationSection: 'Information',
        prices: 'Prices',
        cityList: 'Places (city list)',
        partnerProgram: 'Partnership program',
        faq: 'Questions and answers (FAQ)',
        help: 'Assistance center',
        contact: 'Contact',
        about: 'About bed!OK',
        careers: 'Career',
        information: 'Information',
        termsOfCooperation: 'Cooperation terms',
        privacyPolicy: 'Privacy and cookies policy',
        cookies: 'Manage your cookies settings',
        clientSection: 'customer',
        login: 'Log in',
        registration: 'Registration (sign in)',
        specialOffers: 'Special offers',
        copyrightsNote: {
            firstPart: 'Copyrights',
            year: '2022',
            lastPart: 'bed!Ok. All rights reserved.'
        }
    },
    auth: {
        login: {
            login: 'Log in',
            facebook: 'Facebook log in',
            google: 'Google log in',
            email: {
                placeholder: 'Email'
            },
            password: {
                placeholder: 'Password'
            },
            phoneNumber: {
                placeholder: 'Phone number'
            },
            forgotPassword: 'Forgotten password',
            action: {
                login: 'LOG IN',
                hint: 'Dont have an account? You can create it easily',
                register: 'CREATE NEW ACCOUNT'
            },
        },
        register: {
            register: 'Create an account in an easy way',
            name: {
                placeholder: 'Name*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            phoneNumber: {
                placeholder: 'Phone number*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            email: {
                placeholder: 'Email*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            password: {
                placeholder: 'Password*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            repeatPassword: {
                placeholder: 'Repeat password*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            birthYear: {
                label: 'Year of birth*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            gender: {
                label: 'Sex*',
                validationMessages: {
                    required: 'Required field.'
                },
                options: {
                    woman: "Female",
                    man: "Male"
                },
            },
            languages: {
                label: 'Spoken languages*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            action: {
                hint: 'Already have an account? Just log in'
            },
            generatePassword: 'Generate strong password',
            acceptRegulation: {
                label: 'I accept terms and conditions',
                link: 'click here to read them'
            }
        }
    },
    homeView: {
        title: {
            firstLine: 'Accommodation needed?',
            secondLine: 'Go to Bed!OK and proceed it!',
        },
        looking: 'searching for',
        offering: 'offering',
        joinRoom: 'NEW! Join a room',
        citiesTitle: 'What place are you looking accommodation in?',
        howItWorks: 'How does it work?',
        subscribe: 'Sign up to get updates and promotions',
        freeAppLink: 'Get me link to a free app'
    },
    advertisementView: {
        header: 'Add offer',
        mainSection: {
            title: {
                label: 'Offer title*',
                tip: '7 to 70 characters',
                placeholder: 'E. g. two bed room in a quiet neighbourhood',
                validationMessages: {
                    length: 'Title needs to be from 7 to 70 characters.',
                    required: 'Required field.'
                }
            },
            address: {
                label: 'Address*',
                cityPlaceholder: 'City',
                zipCodePlaceholder: 'Zip code',
                streetPlaceholder: 'Street name',
                streetNumberPlaceholder: 'House No.',
                flatNumberPlaceholder: 'Flat No.',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            photos: {
                label: 'Photos*',
                tip: '1 to 8 photos'
            }
        },
        hostSection: {
            hostName: {
                label: 'Host name*',
                placeholder: 'Name',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            phoneNumber: {
                label: 'Phone number*',
                placeholder: 'E.g. +48 000 000 000',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            email: {
                label: 'E-mail*',
                placeholder: "E. g.john_smith{'@'}o2.pl",
                validationMessages: {
                    required: 'Required field.',
                    email: 'Invalid email'
                }
            },
            photo: {
                label: 'Host photo'
            },
            languages: {
                label: 'Host spoken languages*',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            communicators: {
                label: 'Host communicators*',
                tip: 'Applications for network communication',
                validationMessages: {
                    required: 'Required field.'
                }
            }
        },
        descriptionSection: {
            description: {
                label: 'Description*',
                tip: 'max. 5000 charackters',
                tabs: {
                    own: 'Own',
                    preset1: 'Template 1',
                    preset2: 'Template 2'
                },
                charactersCounter: 'Characters count'
            },
            roomSize: {
                label: 'Room space (m2)*',
                placeholder: 'e.g. 4.86',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            splitIntoBeds: {
                label: 'Bed shared room',
                value: 'share'
            },
            bedsCount: {
                label: 'Room bed number*',
                placeholder: 'e. g. 6',
                validationMessages: {
                    required: 'Required field.'
                }
            },
            roomType: {
                label: 'Room type'
            },
            freeBedsCount: {
                label: 'Room vacant beds number*',
                validationMessages: {
                    required: 'Required field.'
                }
            }
        },
        currentGuestsSection: {
            title: 'Enter current tenants data: name, age, spoken languahes',
            name: {
                placeholder: 'Name'
            },
            birthYear: {
                label: 'Year of birth*'
            }
        },
        paymentSection: {
            paymentMethod: {
                label: 'Payment forms:'
            },
            pricing: {
                label: 'Prices (PLN):'
            },
            day: 'day and night',
            discount1: 'Discount level 1',
            discount2: 'Discount level 2',
            discount3: 'Discount level 3',
            discount4: 'Discount level 4',
            discountMonth: 'Discount level above one month',
        },
        rulesSection: {
            termsOfStay: 'Terms of stay:',
            animals: 'Animals allowed:',
            curfew: 'Quiet hours(22:00 - 6:00):',
            smoking: 'Smoking allowed:',
            others: {
                label: 'Others:',
                placeholder: 'e. g. no parking lot, garden barbecue'
            }
        },
        equipmentSection: {
            roomEquipment: {
                label: 'Room equipment',
                placeholder: 'e. g. lamp, carpet'
            },
            sharedEquipment: {
                label: 'Common zone equipment',
                placeholder: 'e. g. lamp, carpet'
            }
        },
        actions: {
            preview: {
                label: 'Offer preview',
                tip: '(see how your offer looks like before publishing)'
            },
            save: {
                label: 'Save offer',
                tip: '(you can still edit your offer afterwards)'
            },
            publish: {
                label: 'Publish offer',
                tip: '(you can still edit your offer in any time)'
            },
            duplicate: {
                label: 'Clone your offer',
                tip: '(save yoyr time when adding rooms in the same house)'
            }
        }
    },
    advertisementDetailsView: {
        subheader: {
            markAsFavorite: 'Add to favourite',
            share: 'Share'
        },
        descriptionWithMap: {
            description: 'Description:',
            location: 'Location'
        },
        host: {
            meetTheHost: 'MEET YOUR HOST',
            communicators: 'In use:'
        },
        roomArea: 'Room space: {area} m2',
        currentTenants: 'Current tenants:',
        currentTenantsCount: 'Number of people currently living in your room:',
        seeOtherEquipment: 'Check for other conveniences',
        sharedArea: 'Common space: lobby, kitchen, bathroom',
        roomSplitToBeds: 'Shared beds room',
        sharedRoom: 'Shared with other tenants',
        roomEquipment: 'Room equipment:',
        sharedEquipment: 'Common space equipment:',
        paymentMethods: 'Payment methods:',
        rulesOfStay: 'Terms of stay:',
        pricePerBed: 'Price per bed {price} {currency} ({duration})',
        book: 'Book your bed',
        beds: '{count} beds',
        rooms: '{count} rooms'
    },
    hostAdvertisementsView: {
        myAdvertisements: 'My offers',
        expertPanel: 'EXPERT Panel',
        active: 'Active',
        inactive: 'Inactive',
        addNewAd: 'Add new offer1',
        freeBeds: 'Unoccupied: {count} beds',
        messages: 'Messages:',
        newMessagesCount: '{count} unread',
        editAd: 'Edit your offer',
        createFromCurrent: 'Create new offer based on existing one',
        createFromCurrentHint: '(save your time when adding rooms in the same building)',
        deactivateAd: 'Finish your offer',
        deactivateAdHint: '(your offer will be transferred to Inactive section)',
        publishAd: 'Publish your offer',
        publishAdHint: '(you can still edit your offer in any time)',
        removeAd: 'Remove your offer',
        removeAdHint: '(your offer will be permanently removed)'
    },
    expertPanelView: {
        removeTenant: 'Remove tenant',
        addTenant: 'Add tenant',
        removeAllTenants: 'Remove all tenants',
        editAd: 'Edit your offer',
        createAdFromCurrent: 'Create new offer based on existing one',
        expertPanel: 'EXPERT Panel',
        myAdvertisements: 'My offers:',
        address: 'Address:',
        room: 'Room:',
        occupiedBeds: 'Occupied beds:',
        freeBeds: 'Vacant beds:',
        currentTenants: 'Current tenants:',
        createAd: 'Add new offer'
    },
    becomeHostView: {
        list: {
            item1: 'Start renting out without additional fees',
            item2: 'Use a convenient system to manage your real estate',
            item3: 'Rent out beds safely with insurance of up to 2000 PLN',
            item4: 'Get free legal aid'
        },
        action: {
            add: 'Add your offer',
            hint: 'And enjoy safe renting out process'
        }
    },
    searchInput: {
        location: {
            label: 'Location',
            placeholder: 'Where are you looking for a bed?'
        },
        since: 'From',
        to: 'To',
        who: {
            label: 'Who',
            placeholder: 'How many people'
        },
        search: 'Search'
    },
    roomCard: {
        district: 'District:',
        bedsInRoom: '{count} beds in your room',
        dayPrice: '{price} PLN / day',
        bedDayPrice: '{price} PLN / day / bed',
        femaleRoom: 'Female room',
        maleRoom: 'Male room',
        otherGenderRoom: 'Mixed room',
        tenants: 'Tenants:',
        tenantInfo: '{name}, years {age}',
        join: 'Join room'
    },
    order: {
        header: 'Order summary:',
        currentGuests: 'Currently occupied by:',
        totalAmount: 'Total amount: {price}{currency} ({duration} nights)',
        host: 'Host:',
        hint: 'Exact address and getting there directions will be \navailable after payment.',
        proceedToPayment: 'Proceed to payment'
    },
    blog: {
        header: 'Blog and news',
        published: 'Published: {date}',
        readMore: '...read more',
        feed: {
            firstLine: 'Check out whats new',
            secondLine: 'Follow our news section regularly as we publish here important\nannouncements, updates and planned development works. /nIn this section we publish official press releases as well.',
            thirdLine: 'Moreover, we share with our customers (hosts and tenants) practical hints\nabout real estate market. Everyone finds something attractive for himself.',
            title: 'Bed!OK updates',
            subtitle: 'Blog and news',
            loadMore: 'Read more news...'
        }
    },
    about: {
        header: 'About us`',
        firstLine: 'is\nan innovative and rapidly growing web service, quickly\nadopting and making use of most modern technologies (AI) for\noptimizing its solutions. We connect those who are looking for\naccommodation (guests) with those who offer beds (hosts).\nInstead of traditional room-for-rent formula we introduce bed-for-rent more practical solution.',
        secondLine: {
            firstPart: 'Thanks to our service',
            secondPart: 'you will find accommodation quickly.'
        },
        thirdLine: 'Do you need bed quickly? In convenient location, low price and of from trustworthy host?\nwThen you are at the right place!',
        fourthLine: 'No matter whether it is for one night or for the whole year or\neven more. With us you can find it in a minute.'
    },
    career: {
        header: 'Career',
        firstLine: {
            firstPart: 'In',
            secondPart: 'We put people first. We believe in their ambition, motivation and eagerness.\nThat is why we welcome to apply everyone, experienced and beginners, who share our values.',
        },
        secondLine: {
            firstPart: 'There are current vacancies below. Even if you cannot find a position you like, send us your resume - we will get in touch with you.',
            secondPart: ', Fill in the below form and tell us more about yourself. Maybe we can do something together...'
        },
        thirdLine: {
            firstPart: 'Attention (adult) students. Are you \nlooking for quality apprenticeships? Let us know and join our students career program',
            secondPart: 'which helps you start your professional life in an interesting and fast paced startup environment.'
        },
        roles: {
            juniorDev: 'Junior developer',
            keyAccountManager: 'Key account manager',
            photo: 'Photographer'
        }
    },
    contact: {
        header: 'Contact',
        firstLine: 'Feel free to contact us. We do our best to answer immediately.\nMore complex issues we handle in two working days.',
        secondLine: 'The best way to reach our Customer Care office is using\nthe below form. All business inquires\nshould be directed to:',
        thirdLine: {
            firstPart: 'Journalists and media representatives are welcome to contact our press office.\nFor everyhing else contact us at:',
            secondPart: 'For more information check our Media section.'
        },
        form: {
            name: {
                label: 'Your name:*',
                placeholder: 'Name',
                validationMessages: {
                    required: 'Name is required.'
                }
            },
            phone: {
                label: 'Phone number:*',
                placeholder: 'np.: +48 000 000 000',
                validationMessages: {
                    required: 'Phone number is required.'
                }
            },
            email: {
                label: 'Email:*',
                placeholder: 'e. g. john{at}smith.com',
                validationMessages: {
                    required: 'Email address is required.',
                    email: 'Wrong format of email address.'
                }
            },
            message: {
                label: 'Write your message:*',
                placeholder: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                validationMessages: {
                    required: 'Message is required.'
                }
            },
            hint: 'Data required*',
            send: 'Send your message'
        }
    },
    help: {
        header: 'Help (FAQ)',
        firstLine: {
            firstPart: 'Frequently asked questions and answers to them are below.\nCheck this section first before contacting us. There is a high chance yout issue has already been resolved.',
            secondPart: 'All data is accurate and based on common problem users may experience.'
        },
        howTo: 'How does it work',
        qna: 'Questions and answers,',
        questions: {
            howToGetAccount: {
                q: 'How to create new account (register) in bed!OK',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            dataNeededToRegister: {
                q: 'What personal data are required?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howDoPaymentsWork: {
                q: 'What are payment methods?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            },
            howToBeSafe: {
                q: 'How to be safe when looking for accommodation?',
                a: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'
            }
        }
    },
    media: {
        header: 'Media',
        firstLine: 'All press inquiries, including interviews or expert commentary\nare important for us and we always prioritize them. Contact us day and night at',
        secondLine: 'All data published in this web service are copyrighted.\nShould you need to use them in your publication,o\ncontact us and describe your project in order to agree details.\nEspecially when you need to use our logo, pictures, videos and expert articles.\nIn every case the prior authorization of usage is required.',
        thirdLine: 'All patronage and sponsorship reequests or other commercial offer should be thoroughly describe. Include in your offer:',
        details: {
            title: 'Title and publisher',
            reach: 'Estimated (proven) coverage',
            contact: 'Contact details (e-mail, phone number)',
            duration: 'Short characteristic (including time frame)',
            benefit: 'Your expectations'
        },
        fourthLine: {
            firstPart: 'Announcements are published in the following section',
            secondPart: ' "Blog and news"',
            thirdPart: '- the webpage is also an official source for our press releases.'
        }
    }
};
