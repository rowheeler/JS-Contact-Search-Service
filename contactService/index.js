// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

let contactsArray = [];

export default class {
	constructor(updates, service) {
		this.updates = updates;
		this.service = service;
		contactsArray = [];
		this.updates.on('add', (id) => this.addContact(id));
		this.updates.on('remove', (id) => this.deleteContact(id));
		this.updates.on('change', (id, field, value) => this.updateContact(id, field, value));
	}

	search(query) {
		let found = [];
		contactsArray.forEach((contact) => {
			let fullName = `${contact.firstName} ${contact.lastName}`;
			let nickName = `${contact.nickName} ${contact.lastName}`;
			let regex = /[^0-9]/g;
			let queryRegex = /[0-9]/g;
			let phone = contact.primaryPhoneNumber.replaceAll(regex, '');
			let formatQuery = query.replaceAll(regex, '');

			if (queryRegex.test(query)) {
				if (phone.includes(formatQuery)) {
					found.push(this.formatContact(contact));
				}
			} else if (
				contact.firstName.includes(query) ||
				contact.nickName.includes(query) ||
				contact.lastName.includes(query) ||
				fullName.includes(query) ||
				nickName.includes(query)
			) {
				found.push(this.formatContact(contact));
			}
		});

		if (found.length > 0) {
			return found;
		} else {
			return [];
		}
	}

	addContact(id) {
		//Check if ID is already in array
		this.service.getById(id).then((item) => {
			//Check if ID is already in array
			let found = contactsArray.find((contact) => contact.id === id);
			if (found === undefined) {
				contactsArray.push(item);
			}
		});
	}

	deleteContact(id) {
		for (let i = 0; i < contactsArray.length; i++) {
			if (contactsArray[i].id === id) {
				contactsArray.splice(i, 1);
			}
		}
	}

	updateContact(id, field, value) {
		let index;
		let contact;
		index = contactsArray.findIndex((contact) => contact.id === id);
		contact = contactsArray[index];
		Object.keys(contact).forEach((val) => {
			if (val === field) {
				contact[val] = value;
			}
		});
	}

	//receives a single contact and returns a formatted contact
	formatContact(contact) {
		let phoneNumbers;
		let phone = [];
		if (!!contact.primaryPhoneNumber) {
			phone.push(contact.primaryPhoneNumber);
		}
		if (!!contact.secondaryPhoneNumber) {
			phone.push(contact.secondaryPhoneNumber);
		}

		if (phone.length > 0) {
			phoneNumbers = this.formatPhoneNumber(phone);
		}

		let formatedContact = {
			id: contact.id,
			name: (contact.nickName ? contact.nickName : contact.firstName) + ' ' + contact.lastName,
			email: contact.primaryEmail,
			phones: phoneNumbers,
			address: contact.addressLine1
		};

		return formatedContact;
	}

	//Checks phone number type and formats it to expected format
	formatPhoneNumber(phoneNumbers) {
		let numbers = [];
		let numCheck = /-/g;
		let phone;
		let formattedPhoneNumber;
		phoneNumbers.forEach((number) => {
			if (numCheck.test(number)) {
				phone = number.split('-');
				formattedPhoneNumber = `(${phone[0]}) ${phone[1]}-${phone[2]}`;
				numbers.push(formattedPhoneNumber);
			} else {
				formattedPhoneNumber = `(${number.slice(2, 5)}) ${number.slice(5, 8)}-${number.slice(8)}`;
				numbers.push(formattedPhoneNumber);
			}
		});

		return numbers;
	}
}
