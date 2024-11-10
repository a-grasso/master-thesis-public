package api

import "context"

type Service struct{}

func (Service) ListPets(ctx context.Context, request ListPetsRequestObject) (ListPetsResponseObject, error) {
	return ListPets200JSONResponse{
		Body: []Pet{
			{
				Id:   1,
				Name: "Dog",
			},
			{
				Id:   2,
				Name: "Cat",
			},
		},
	}, nil
}

func (Service) CreatePets(ctx context.Context, request CreatePetsRequestObject) (CreatePetsResponseObject, error) {
	return CreatePets201Response{}, nil
}

func (Service) ShowPetById(ctx context.Context, request ShowPetByIdRequestObject) (ShowPetByIdResponseObject, error) {
	return ShowPetById200JSONResponse{Id: 1, Name: "Dog"}, nil
}
