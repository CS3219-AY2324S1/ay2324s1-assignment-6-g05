type Room = {
    id: string;
    owner: Partner;
    partner?: Partner;
    preferences: Preference;
    matched?: boolean = false;
    createdOn?: Date = new Date();
};

export default Room;
