package org.springcloudspike.pimper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import reactor.core.publisher.Flux;

import java.util.function.Function;
import java.util.function.Supplier;

@SpringBootApplication
public class PimperApplication {

	public static void main(String[] args) {
		SpringApplication.run(PimperApplication.class, args);
	}

	@Bean
	public Function<Flux<String>, Flux<String>> pimp() {
		return flux -> flux.map(s -> "***" + s + "***");
	}

	@Bean
	public Supplier<Flux<String>> stringSupplier() {
		return () -> Flux.just("one", "two", "three");
	}
}

