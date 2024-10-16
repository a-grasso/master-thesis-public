package org.springcloudspike.merchant.functions;

import org.springcloudspike.merchant.model.Person;
import org.springcloudspike.merchant.repository.PersonRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.util.function.UnaryOperator;

@Component
public class SavePerson implements UnaryOperator<Flux<Person>> {

	private final PersonRepository repository;

	public SavePerson(PersonRepository repository) {
		this.repository = repository;
	}

	@Override
	public Flux<Person> apply(Flux<Person> flux) {
		return flux.publishOn(Schedulers.boundedElastic()).map(repository::save);
	}
}
