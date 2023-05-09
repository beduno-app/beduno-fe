export function mapLanguageCodeToLanguageData(language: 'pl' | 'en' | 'de' | 'ru' | 'uk') {
    switch (language) {
        case 'pl': return { content: "polski", key: "polish", text: "Polski", icon: "pl" };
        case 'en': return { content: "angielski", key: "english", text: "Angielski", icon: "uk" };
        case 'de': return { content: "niemiecki", key: "german", text: "Niemiecki", icon: "de" };
        case 'ru': return { content: "rosyjski", key: "russian", text: "Rosyjski", icon: "ru" };
        case 'uk': return { content: "ukraiński", key: "ukrainian", text: "Ukraiński", icon: "ua" };
    }
}
