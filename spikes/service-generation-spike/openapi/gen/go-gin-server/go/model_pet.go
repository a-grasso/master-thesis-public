/*
 * Swagger Petstore
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package openapi

type Pet struct {
	Id int64 `json:"id"`

	Name string `json:"name"`

	Tag string `json:"tag,omitempty"`
}
