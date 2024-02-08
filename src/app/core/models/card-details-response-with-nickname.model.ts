export interface CardDetailsResponseWithNickName {
  full_card_number: string;
  cvv: string;
  expiry_date: Date;
  nick_name?: string;
}
