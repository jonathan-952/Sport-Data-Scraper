function DateConverter(date) {
    res = ""
    const firstSlash = date.indexOf('/');
    const month = parseInt(date.slice(0, firstSlash));
    switch (month) {
        case 1:
            res += "January ";
            break;
        case 2:
            res += "February ";
            break;
        case 3:
            res += "March ";
            break;
        case 4:
            res += "April ";
            break;
        case 5:
            res += "May ";
            break;
        case 6:
            res += "June ";
            break;
        case 7:
            res += "July ";
            break;
        case 8:
            res += "August ";
            break;
        case 9:
            res += "September ";
            break;
        case 10:
            res += "October ";
            break;
        case 11:
            res += "November ";
            break;
        case 12:
            res += "December ";
            break;
    }

    const secondSlash = date.indexOf('/', firstSlash + 1);
    const day = parseInt(date.slice(firstSlash + 1, secondSlash));

    switch (day) {
        case 1:
            res += "01,";
            break;
        case 2:
            res += "02,";
            break;
        case 3:
            res += "03,";
            break;
        case 4:
            res += "04,";
            break;
        case 5:
            res += "05,";
            break;
        case 6:
            res += "06,";
            break;
        case 7:
            res += "07,";
            break;
        case 8:
            res += "08,";
            break;
        case 9:
            res += "09,";
            break;
        default:
            res += `${date.split('/')[1]},`;
    }
    res += ` ${date.split('/')[2]}`;

    return res;
}

module.exports = DateConverter