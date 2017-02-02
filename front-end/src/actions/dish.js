import $ from 'jquery';

export const setName = (name) => ({
	type: 'SET_DISH_NAME',
	name
});

export const setPrice = (price) => ({
	type: 'SET_DISH_PRICE',
	price
});

export const setDescription = (description) => ({
	type: 'SET_DISH_DESCRIPTION',
	description
});

export const setImage = (image) => ({
	type: 'SET_DISH_IMAGE',
	image
});

export const setDoing = (doing) => ({
	type: 'SET_DISH_DOING',
	doing
});

export const setStatus = (status) => ({
	type: 'SET_DISH_STATUS',
	status
});

export const addDish = (dispatch, getState) => {
	const dish = getState().dish;
	console.log('Add dish', dish);
	dispatch(setDoing(true));
	$.post('/agent/dish', {
		name: dish.name,
		price: dish.price,
		info: dish.description,
		img: dish.image
	}, (data) => {
		console.log('Result', data);
		if (data.errorCode === 0) {
			dispatch(setStatus('Thêm thành công!'));
			dispatch(setDoing(false));
		} else {
			dispatch(setStatus('Thêm thất bại!'));
			dispatch(setDoing(false));
		}
	});
};